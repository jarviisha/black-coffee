import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { useGetNotifications, getNotificationsQueryKey } from "@/api/hooks/useGetNotifications"
import { getUnreadCountQueryKey } from "@/api/hooks/useGetUnreadCount"
import { useMarkAllNotificationsAsRead } from "@/api/hooks/useMarkAllNotificationsAsRead"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { NotificationItem } from "./NotificationItem"
import type { DtoNotificationResponse } from "@/api/models/dto/NotificationResponse"

export function NotificationList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  const [paginationVersion, setPaginationVersion] = useState(0)
  const firstNotifIdRef = useRef<string | undefined>(undefined)

  const { data, isLoading, isFetching, isError } = useGetNotifications(
    cursor ? { cursor } : undefined,
  )

  // Detect new notification arriving at top of initial page (SSE → invalidate → refetch)
  useEffect(() => {
    if (cursor !== undefined || !data?.data?.length) return
    const firstId = data.data[0].id
    if (firstNotifIdRef.current !== undefined && firstId !== firstNotifIdRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaginationVersion((v) => v + 1)
    }
    firstNotifIdRef.current = firstId
  }, [data, cursor])

  const { items, sentinelRef } = useCursorPagination<DtoNotificationResponse>({
    cursor,
    onNextPage: setCursor,
    isFetching,
    page: data,
    resetKey: paginationVersion,
  })

  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsAsRead({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getNotificationsQueryKey() })
        void queryClient.invalidateQueries({ queryKey: getUnreadCountQueryKey() })
        // Reset list to reload from first page
        setCursor(undefined)
      },
    },
  })

  const hasUnread = items.some((n) => !n.is_read)

  if (isLoading && items.length === 0) {
    return <Spinner centered className="py-16" />
  }

  if (isError && items.length === 0) {
    return (
      <p className="text-text-muted py-16 text-center text-sm">{t("notification.loadError")}</p>
    )
  }

  if (!isLoading && items.length === 0) {
    return <p className="text-text-muted py-16 text-center text-sm">{t("notification.empty")}</p>
  }

  return (
    <div className="py-2">
      {/* Mark all read */}
      {hasUnread && (
        <div className="flex hidden justify-end">
          <Button
            variant="ghost"
            color="muted"
            size="sm"
            isLoading={isMarkingAll}
            onClick={() => markAll()}
          >
            {t("notification.markAllRead")}
          </Button>
        </div>
      )}

      <div className="space-y-2 rounded p-2">
        {items.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} />

      {isFetching && <Spinner centered className="py-6" />}
    </div>
  )
}
