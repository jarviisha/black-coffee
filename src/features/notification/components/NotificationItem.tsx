import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { cn, timeAgo } from "@/lib/utils"
import { Avatar } from "@/components/ui/Avatar"
import { useMarkNotificationAsRead } from "@/api/hooks/useMarkNotificationAsRead"
import { getNotificationsQueryKey } from "@/api/hooks/useGetNotifications"
import { getUnreadCountQueryKey } from "@/api/hooks/useGetUnreadCount"
import type { DtoNotificationResponse } from "@/api/models/dto/NotificationResponse"
import Icon from "@/components/ui/Icon"

type NotificationType = NonNullable<DtoNotificationResponse["type"]>
type IconProps = {
  name: string
  size?: number
  className?: string
}

const NOTIFICATION_TYPE_ICON: Record<NotificationType, IconProps> = {
  like: { size: 16, className: "text-red-500", name: "heart-fill" },
  comment_like: { size: 16, className: "text-red-500", name: "heart-fill" },
  comment: { size: 16, className: "text-blue-500", name: "message-circle-fill" },
  reply: { size: 16, className: "text-blue-500", name: "reply-fill" },
  follow: { size: 16, className: "text-green-500", name: "user-plus" },
  repost: { size: 16, className: "text-green-500", name: "repost" },
  mention: { size: 16, className: "text-yellow-500", name: "at-sign" },
  system_announcement: { size: 16, className: "text-text", name: "speakerphone" },
}

function resolveTarget(n: DtoNotificationResponse): string | null {
  switch (n.type) {
    case "follow":
      return n.actor?.username ? `/@${n.actor.username}` : null
    case "like":
    case "comment_like":
    case "comment":
    case "reply":
    case "repost":
    case "mention":
      return n.target_id ? `/post/${n.target_id}` : null
    case "system_announcement":
      return null
    default:
      return null
  }
}

interface NotificationItemProps {
  notification: DtoNotificationResponse
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { mutate: markRead } = useMarkNotificationAsRead({
    mutation: {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: getNotificationsQueryKey() })
        void queryClient.invalidateQueries({ queryKey: getUnreadCountQueryKey() })
      },
    },
  })

  const actor = notification.actor
  const groupCount = notification.group_count ?? 0
  const isGrouped = groupCount > 1
  const typeKey = notification.type as NotificationType
  const typeLabel = typeKey ? t(`notification.types.${typeKey}` as never) : ""
  const icon = typeKey ? NOTIFICATION_TYPE_ICON[typeKey] : null

  const handleClick = () => {
    const target = resolveTarget(notification)

    if (!notification.is_read && notification.id) {
      markRead({ notificationID: notification.id })
    }

    if (target) void navigate(target)
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "bg-surface flex w-full items-start gap-3 rounded border-2 border-transparent p-4 text-left transition-colors motion-reduce:transition-none",
        "hover:bg-surface-hi focus-visible:bg-surface-hi focus-visible:outline-none",
        !notification.is_read && "border-border",
      )}
    >
      {/* Unread dot */}
      <div className="mt-1.5 flex w-2 shrink-0 items-start justify-center">
        {!notification.is_read && (
          <span className="bg-accent block h-2 w-2 rounded-full" aria-hidden="true" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar src={actor?.avatar_url} name={actor?.display_name} size="lg" />
        {icon && (
          <span className="bg-surface ring-border absolute right-0 bottom-0 flex items-center justify-center rounded-full p-0.5 ring-1">
            <Icon {...icon} />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-text text-sm">
          <span className="font-bold">{actor?.display_name ?? actor?.username}</span>
          {isGrouped && groupCount > 2 && (
            <> {t("notification.grouped", { count: groupCount - 1 })}</>
          )}
          {"  "}
          {typeLabel}
        </p>
        {notification.message && (
          <p className="text-text-muted mt-1 line-clamp-3 text-sm">{notification.message}</p>
        )}
        {notification.created_at && (
          <p className="text-text-sub mt-1 text-xs font-semibold">
            {timeAgo(notification.created_at)}
          </p>
        )}
      </div>
    </button>
  )
}
