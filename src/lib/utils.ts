import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format } from "date-fns"
import { vi, enUS } from "date-fns/locale"
import { i18n } from "@/lib/i18n"
import { isAxiosError } from "axios"

const DATE_FNS_LOCALES = { vi, en: enUS }

function getLocale() {
  const lang = i18n.language?.slice(0, 2)
  return DATE_FNS_LOCALES[lang as keyof typeof DATE_FNS_LOCALES] ?? enUS
}

/**
 * Extract a user-facing message from an API error response.
 *
 * darkvoid nests failures as { error: { code, message, details } }; the flat
 * { message } shape is kept as a fallback for endpoints that still return it.
 * Returns null when the response carries no usable message (network error,
 * timeout, 5xx with an empty body) — callers must supply their own fallback.
 */
export function getApiErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null
  const data = error.response?.data as
    | { message?: unknown; error?: { message?: unknown } }
    | undefined
  const message = data?.error?.message ?? data?.message
  return typeof message === "string" && message.length > 0 ? message : null
}

/** Machine-readable failure code from the API, e.g. "SELF_LIKE". */
export function getApiErrorCode(error: unknown): string | null {
  if (!isAxiosError(error)) return null
  const data = error.response?.data as { error?: { code?: unknown } } | undefined
  const code = data?.error?.code
  return typeof code === "string" && code.length > 0 ? code : null
}

/**
 * User-facing message for a failed API call.
 *
 * The API answers in English only, so a known error code is translated before
 * the server's own wording is considered. The fallback covers responses that
 * carry neither (network error, timeout, empty 5xx body).
 */
export function apiErrorMessage(
  error: unknown,
  fallback: string,
  translations?: Record<string, string>,
): string {
  const code = getApiErrorCode(error)
  if (code && translations?.[code]) return translations[code]
  return getApiErrorMessage(error) ?? fallback
}

/** HTTP status of an API error, or null if it never reached the server. */
export function getApiErrorStatus(error: unknown): number | null {
  if (!isAxiosError(error)) return null
  return error.response?.status ?? null
}

/** Safely merge Tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Relative time string, e.g. "2 hours ago" */
export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: getLocale() })
}

/** Compact number format, e.g. 1500 → "1,5K" */
export function formatCount(n: number): string {
  if (n < 1_000) return String(n)
  if (n < 1_000_000) {
    const val = n / 1_000
    const formatted = val % 1 === 0 ? String(val) : val.toFixed(1).replace(".", ",")
    return `${formatted}K`
  }
  if (n < 1_000_000_000) {
    const val = n / 1_000_000
    const formatted = val % 1 === 0 ? String(val) : val.toFixed(1).replace(".", ",")
    return `${formatted}M`
  }
  const val = n / 1_000_000_000
  const formatted = val % 1 === 0 ? String(val) : val.toFixed(1).replace(".", ",")
  return `${formatted}B`
}

/** Full date format, e.g. "23 March, 2026" */
export function formatDate(date: string | Date) {
  return format(new Date(date), "dd MMMM, yyyy", { locale: getLocale() })
}

/** Date + time format, e.g. "23 thg 3, 2026 · 14:30" */
export function formatDateTime(date: string | Date) {
  return format(new Date(date), "dd MMM, yyyy · HH:mm", { locale: getLocale() })
}
