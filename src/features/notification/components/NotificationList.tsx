import { useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useQueryClient, type InfiniteData } from "@tanstack/react-query"
import { getNotificationsQueryKey } from "@/api/hooks/useGetNotifications"
import { useGetNotificationsInfinite } from "../hooks/useGetNotificationsInfinite"
import { getUnreadCountQueryKey } from "@/api/hooks/useGetUnreadCount"
import { useMarkAllNotificationsAsRead } from "@/api/hooks/useMarkAllNotificationsAsRead"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { NotificationItem } from "./NotificationItem"
import type { GetNotificationsQueryResponse } from "@/api/models/GetNotifications"

export function NotificationList() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetNotificationsInfinite()

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const { mutate: markAll, isPending: isMarkingAll } = useMarkAllNotificationsAsRead({
    mutation: {
      onSuccess: () => {
        // Cập nhật Optimistic trực tiếp trên cache, tránh reset màn hình cuộn xuống
        queryClient.setQueryData<InfiniteData<GetNotificationsQueryResponse>>(
          getNotificationsQueryKey(),
          (oldData) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: page.data?.map((n) => ({ ...n, is_read: true })) ?? [],
              })),
            }
          },
        )
        void queryClient.invalidateQueries({ queryKey: getUnreadCountQueryKey() })
      },
    },
  })

  const items = data?.pages.flatMap((page) => page.data ?? []) ?? []
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

      {isFetchingNextPage && <Spinner centered className="py-6" />}
    </div>
  )
}
