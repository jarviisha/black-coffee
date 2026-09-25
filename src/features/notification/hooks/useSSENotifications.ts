import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { getNotificationsQueryKey } from "@/api/hooks/useGetNotifications"
import { getUnreadCountQueryKey } from "@/api/hooks/useGetUnreadCount"
import { i18n } from "@/lib/i18n"
import type { DtoNotificationResponse } from "@/api/models/dto/NotificationResponse"

const RETRY_DELAY_MS = 3000

/**
 * Streams /notifications/stream over fetch, invalidates notification queries,
 * and shows a toast when an event arrives. The backend only accepts the JWT
 * via the Authorization header (query tokens leak into logs), which native
 * EventSource cannot send — hence the manual reader. Reconnects after a short
 * delay, re-reading the token from the store so a refreshed token is picked up.
 */
export function useSSENotifications() {
  const queryClient = useQueryClient()
  const hasToken = useAuthStore((s) => !!s.accessToken)

  useEffect(() => {
    if (!hasToken) return

    const baseURL =
      (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080/api/v1"
    const controller = new AbortController()
    let retryTimer: ReturnType<typeof setTimeout>

    const handleNotification = (data: string) => {
      void queryClient.invalidateQueries({ queryKey: getNotificationsQueryKey() })
      void queryClient.invalidateQueries({ queryKey: getUnreadCountQueryKey() })

      try {
        const parsed = JSON.parse(data) as DtoNotificationResponse
        const actorName = parsed.actor?.display_name ?? parsed.actor?.username
        const typeLabel = parsed.type
          ? i18n.t(`notification.types.${parsed.type}` as never, "")
          : ""

        if (actorName && typeLabel) {
          toast(actorName, { description: typeLabel })
        } else if (parsed.message) {
          toast(parsed.message)
        }
      } catch {
        // Event has no parseable data — skip toast
      }
    }

    const connect = async () => {
      const token = useAuthStore.getState().accessToken
      if (!token) return

      const res = await fetch(`${baseURL}/notifications/stream`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
        signal: controller.signal,
      })
      if (!res.ok || !res.body) throw new Error(`SSE connect failed: ${res.status}`)

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
      let buffer = ""
      for (;;) {
        const { done, value } = await reader.read()
        if (done) return
        buffer += value
        // Events are blocks separated by a blank line; data lines carry payload
        const blocks = buffer.split("\n\n")
        buffer = blocks.pop() ?? ""
        for (const block of blocks) {
          const data = block
            .split("\n")
            .filter((line) => line.startsWith("data:"))
            .map((line) => line.slice(5).trimStart())
            .join("\n")
          if (data) handleNotification(data)
        }
      }
    }

    const run = () => {
      connect()
        .catch(() => undefined)
        .finally(() => {
          if (!controller.signal.aborted) retryTimer = setTimeout(run, RETRY_DELAY_MS)
        })
    }
    run()

    return () => {
      controller.abort()
      clearTimeout(retryTimer)
    }
  }, [hasToken, queryClient])
}
