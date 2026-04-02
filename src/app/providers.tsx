import { lazy, Suspense, useEffect, type ReactNode } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { queryClient } from "@/lib/queryClient"
import { useThemeStore } from "@/store/themeStore"
import { useAuthStore } from "@/store/authStore"
import { refreshToken } from "@/api/clients/refreshToken"
import { getMe } from "@/api/clients/getMe"

// Initialize axios interceptors (side-effect import)
import "@/lib/axios"
// Initialize i18n (side-effect import)
import "@/lib/i18n"

const ReactQueryDevtools = lazy(() =>
  import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })),
)

function AuthInitializer() {
  useEffect(() => {
    // Read store state directly — not via subscription — so token updates after
    // a successful refresh do not re-trigger this effect.
    const { setTokens, setUser, setInitialized, logout } = useAuthStore.getState()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10_000)

    // refresh_token is sent automatically via HttpOnly cookie — no body needed
    refreshToken(undefined, undefined, { signal: controller.signal })
      .then(async (data) => {
        if (data.access_token) {
          setTokens(data.access_token)
          // Fetch fresh user profile after obtaining a new access token
          try {
            const me = await getMe()
            if (me) setUser(me)
          } catch {
            // Non-critical — persisted user data remains usable
          }
        }
      })
      .catch((err: unknown) => {
        // Axios throws CanceledError (name: "CanceledError") when aborted via AbortSignal,
        // not the native fetch AbortError — both must be ignored to avoid spurious logout.
        if (err instanceof Error && (err.name === "AbortError" || err.name === "CanceledError")) return
        // Only logout when the server explicitly rejects the refresh token (401).
        // Network errors, 5xx, CORS failures, etc. should not clear the session.
        const status = (err as { response?: { status?: number } }).response?.status
        if (status === 401) logout()
      })
      .finally(() => {
        clearTimeout(timeoutId)
        // Only mark initialized if this effect was not cleaned up (Strict Mode safety)
        if (!controller.signal.aborted) setInitialized()
      })

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, []) // Empty deps — auth init runs exactly once on mount

  return null
}

function AppToaster() {
  const { theme } = useThemeStore()
  return (
    <Toaster
      position="bottom-right"
      theme={theme}
      toastOptions={{
        style: {
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--text)",
        },
      }}
    />
  )
}

function ThemeApplier() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = (prefersDark: boolean) => {
      const isDark = theme === "dark" || (theme === "system" && prefersDark)
      root.classList.toggle("dark", isDark)
    }

    apply(mq.matches)

    if (theme === "system") {
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener("change", handler)
      return () => mq.removeEventListener("change", handler)
    }
  }, [theme])

  return null
}

type Props = {
  children: ReactNode
}

export function Providers({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <ThemeApplier />
      <AppToaster />
      {children}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  )
}
