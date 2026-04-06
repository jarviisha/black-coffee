import { useTranslation } from "react-i18next"
import { timeAgo } from "@/lib/utils"
import { Avatar } from "@/components/ui/Avatar"
import { LinkedUserInfo } from "@/components/ui/UserInfo"
import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/Button"

interface PostHeaderProps {
  author?: {
    id?: string
    avatar_url?: string
    display_name?: string
    username?: string
  }
  createdAt?: string
  showFollow?: boolean
  isFollowPending?: boolean
  onFollow?: () => void
}

export function PostHeader({
  author,
  createdAt,
  showFollow,
  isFollowPending,
  onFollow,
}: PostHeaderProps) {
  const { t } = useTranslation()
  const timeAgoStr = createdAt ? timeAgo(createdAt) : null

  return (
    <div className="flex items-center gap-3">
      <Avatar src={author?.avatar_url} name={author?.display_name} href={`/@${author?.username}`} />
      <LinkedUserInfo
        displayName={author?.display_name}
        username={author?.username}
        meta={timeAgoStr}
      />
      {showFollow && (
        <Button
          type="button"
          onClick={onFollow}
          size="xs"
          disabled={isFollowPending}
          aria-label={t("profile.follow")}
        >
          <Icon name="user-plus" size={16} />
          {t("profile.follow")}
        </Button>
      )}
    </div>
  )
}
