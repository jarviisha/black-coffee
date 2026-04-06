import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { ButtonIcon } from "@/components/ui/Button"
import { formatDateTime, formatCount } from "@/lib/utils"

interface PostActionsProps {
  postId?: string
  liked: boolean
  likeCount: number
  commentCount: number
  createdAt?: string
  onLike: () => void
}

export function PostActions({
  postId,
  liked,
  likeCount,
  commentCount,
  createdAt,
  onLike,
}: PostActionsProps) {
  const { t } = useTranslation()

  return (
    <div className="text-text-muted flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div
          aria-pressed={liked}
          className={`hover:text-like flex items-center gap-1.5 text-xs font-bold transition-colors motion-reduce:transition-none ${liked ? "text-like" : ""}`}
        >
          <ButtonIcon
            onClick={onLike}
            name={liked ? "heart-fill" : "heart"}
            iconSize={20}
            aria-label={liked ? t("post.unlike") : t("post.like")}
          />
          <span aria-hidden="true" className="cursor-pointer hover:underline">
            {formatCount(likeCount)}
          </span>
        </div>

        <Link
          to={`/post/${postId}`}
          aria-label={t("post.comments", { count: commentCount })}
          className="hover:text-text flex items-center gap-1.5 text-xs font-bold transition-colors motion-reduce:transition-none"
        >
          <Icon name="message-circle" size={20} />
          <span aria-hidden="true">{formatCount(commentCount)}</span>
        </Link>
      </div>

      {createdAt && (
        <time dateTime={createdAt} className="text-text-sub text-xs">
          {formatDateTime(createdAt)}
        </time>
      )}
    </div>
  )
}
