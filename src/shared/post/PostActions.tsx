import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { ButtonIcon } from "@/components/ui/Button"
import { cn, formatDateTime, formatCount } from "@/lib/utils"

interface PostActionsProps {
  postId?: string
  /** False on your own posts — the server rejects self-likes. */
  canLike?: boolean
  liked: boolean
  likeCount: number
  commentCount: number
  createdAt?: string
  onLike: () => void
}

// Icons stay at 20px; the touch area around them is padded out to ~44px.
const TAP_TARGET = "-m-2.5 flex h-11 w-11 items-center justify-center"

export function PostActions({
  postId,
  canLike = true,
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
          aria-pressed={canLike ? liked : undefined}
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold transition-colors motion-reduce:transition-none",
            liked && "text-like",
            canLike && "hover:text-like",
          )}
        >
          {canLike ? (
            <ButtonIcon
              onClick={onLike}
              name={liked ? "heart-fill" : "heart"}
              iconSize={20}
              aria-label={liked ? t("post.unlike") : t("post.like")}
              className={TAP_TARGET}
            />
          ) : (
            <span className={TAP_TARGET}>
              <Icon name={liked ? "heart-fill" : "heart"} size={20} />
            </span>
          )}
          <span aria-hidden="true">{formatCount(likeCount)}</span>
        </div>

        <Link
          to={`/post/${postId}`}
          aria-label={t("post.comments", { count: commentCount })}
          className="hover:text-text flex items-center gap-1.5 text-xs font-bold transition-colors motion-reduce:transition-none"
        >
          <span className={TAP_TARGET}>
            <Icon name="message-circle" size={20} />
          </span>
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
