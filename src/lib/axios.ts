import { axiosInstance, setConfig } from "@kubb/plugin-client/clients/axios"
import type { InternalAxiosRequestConfig } from "axios"
import axios from "axios"
import { useAuthStore } from "@/store/authStore"
import { router } from "@/app/router"
import { shouldAttemptRefresh } from "./shouldAttemptRefresh"

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

interface TokenResponse {
  access_token: string
}

// Fix #3: single source of truth for base URL
const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080/api/v1"

setConfig({ baseURL: BASE_URL })
// setConfig only updates kubb's internal _config used by the client() wrapper.
// Direct axiosInstance.post() calls in interceptors use axiosInstance.defaults,
// so both must be kept in sync.
axiosInstance.defaults.baseURL = BASE_URL
axiosInstance.defaults.withCredentials = true
// Without a timeout a stalled backend leaves buttons stuck in their pending
// state forever (observed: a dev API that swung between 0.6s and 15s).
axiosInstance.defaults.timeout = 20_000

// Uploads move real bytes and routinely outlast a JSON call. Kubb's RequestConfig
// has no timeout field, so the exception is applied here rather than per call site.
const UPLOAD_TIMEOUT_MS = 120_000
const UPLOAD_PATHS = ["/media/upload", "/me/avatar", "/me/cover"]

// ─── Request interceptor: attach access token ───────────────────────────
axiosInstance.interceptors.request.use((config) => {
  if (UPLOAD_PATHS.some((path) => config.url?.includes(path))) {
    config.timeout = UPLOAD_TIMEOUT_MS
  }

  // Skip auth header for refresh endpoint — server authenticates via HttpOnly cookie
  if (config.url?.includes("/auth/refresh")) return config

  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: handle 401 → refresh token → retry ─────────────
let isRefreshing = false

// Fix #1: queue entries carry both resolve and reject so promises never hang
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void }
let queue: QueueEntry[] = []

const processQueue = (token: string) => {
  queue.forEach(({ resolve }) => resolve(token))
  queue = []
}

const rejectQueue = (err: unknown) => {
  queue.forEach(({ reject }) => reject(err))
  queue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (rawError: unknown) => {
    // Fix #2: use axios.isAxiosError type guard instead of unsafe cast
    if (!axios.isAxiosError(rawError)) {
      return Promise.reject(rawError instanceof Error ? rawError : new Error(String(rawError)))
    }

    const original = rawError.config as RetriableConfig | undefined
    const { accessToken, setTokens, logout } = useAuthStore.getState()

    if (
      !shouldAttemptRefresh({
        status: rawError.response?.status,
        url: original?.url,
        alreadyRetried: original?._retry ?? false,
        hasSession: accessToken !== null,
      })
    ) {
      return Promise.reject(rawError)
    }

    // Queue the request if already refreshing
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            if (original) {
              original.headers.Authorization = `Bearer ${token}`
              resolve(axiosInstance(original))
            }
          },
          reject,
        })
      })
    }

    if (original) original._retry = true
    isRefreshing = true

    try {
      // refresh_token is sent automatically via HttpOnly cookie
      const res = await axiosInstance.post<TokenResponse>("/auth/refresh")
      const { access_token } = res.data

      // The user can log out while this request is in flight. Applying the new
      // token then would hand the session straight back, and processQueue would
      // replay the waiting requests authenticated.
      if (useAuthStore.getState().accessToken === null) {
        const err = new Error("Session ended during refresh")
        rejectQueue(err)
        return Promise.reject(err)
      }

      setTokens(access_token)
      processQueue(access_token)

      if (original) {
        original.headers.Authorization = `Bearer ${access_token}`
        return axiosInstance(original)
      }
      return Promise.reject(new Error("Missing original request config"))
    } catch (err) {
      // Fix #1: reject all queued promises so they don't hang
      rejectQueue(err)
      logout()
      void router.navigate("/login", { replace: true })
      return Promise.reject(err instanceof Error ? err : new Error(String(err)))
    } finally {
      isRefreshing = false
    }
  },
)

export { axiosInstance }
