import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuthStore } from "@/store/authStore"
import { getNotificationsQueryKey } from "@/api/hooks/useGetNotifications"
import { getUnreadCountQueryKey } from "@/api/hooks/useGetUnreadCount"
import { i18n } from "@/lib/i18n"
import type { DtoNotificationResponse } from "@/api/models/dto/NotificationResponse"

/**
 * Opens an SSE connection to /notifications/stream, invalidates
 * notification queries, and shows a toast when a new event arrives.
 * Automatically reconnects on error (browser EventSource behavior).
 */
export function useSSENotifications() {
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)

  useEffect(() => {
    if (!accessToken) return

    const baseURL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080/api/v1"
    const url = `${baseURL}/notifications/stream?token=${encodeURIComponent(accessToken)}`
    const es = new EventSource(url)

    const handleNotification = (event: Event) => {
      void queryClient.invalidateQueries({ queryKey: getNotificationsQueryKey() })
      void queryClient.invalidateQueries({ queryKey: getUnreadCountQueryKey() })

      try {
        const data = JSON.parse((event as MessageEvent).data) as DtoNotificationResponse
        const actorName = data.actor?.display_name ?? data.actor?.username
        const typeLabel = data.type ? i18n.t(`notification.types.${data.type}` as never, "") : ""

        if (actorName && typeLabel) {
          toast(actorName, { description: typeLabel })
        } else if (data.message) {
          toast(data.message)
        }
      } catch {
        // Event has no parseable data — skip toast
      }
    }

    es.addEventListener("notification", handleNotification)
    // Also handle generic "message" events in case backend uses default event type
    es.onmessage = handleNotification

    return () => {
      es.close()
    }
  }, [accessToken, queryClient])
}
