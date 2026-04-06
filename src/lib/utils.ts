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

/** Extract a user-facing message from an API error response */
export function getApiErrorMessage(error: unknown): string | null {
  if (!isAxiosError(error)) return null
  const message = (error.response?.data as { message?: unknown } | undefined)?.message
  return typeof message === "string" ? message : null
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
