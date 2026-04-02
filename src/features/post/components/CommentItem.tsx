import { useState } from "react"
import { useTranslation } from "react-i18next"
import { cn, timeAgo } from "@/lib/utils"
import { Avatar } from "@/components/ui/Avatar"
import { LinkedUserInfo } from "@/components/ui/UserInfo"
import Icon from "@/components/ui/Icon"
import { Spinner } from "@/components/ui/Spinner"
import { useToggleCommentLike } from "@/api/hooks/useToggleCommentLike"
import { useGetReplies } from "@/api/hooks/useGetReplies"
import { CommentInput } from "./CommentInput"
import type { DtoCommentResponse } from "@/api/models/dto/CommentResponse"

function formatCount(n: number): string {
  if (n < 1000) return String(n)
  const val = n / 1000
  const formatted = val % 1 === 0 ? String(val) : val.toFixed(1).replace(".", ",")
  return `${formatted}K`
}

interface CommentItemProps {
  comment: DtoCommentResponse
  postId: string
  depth?: number
}

export function CommentItem({ comment, postId, depth = 0 }: CommentItemProps) {
  const { t } = useTranslation()
  const [isLiked, setIsLiked] = useState(comment.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(comment.like_count ?? 0)
  const [isReplying, setIsReplying] = useState(false)
  const [showReplies, setShowReplies] = useState(true)
  const [showAllReplies, setShowAllReplies] = useState(false)

  const { mutate: toggleCommentLike } = useToggleCommentLike()
  const { data: allRepliesData, isLoading: isLoadingReplies } = useGetReplies(
    postId,
    comment.id!,
    undefined,
    {
      query: { enabled: showAllReplies },
    },
  )

  const previewReplies = comment.replies ?? []
  const replyCount = comment.reply_count ?? 0
  const allReplies = showAllReplies ? (allRepliesData?.data ?? previewReplies) : previewReplies
  const moreCount = replyCount - previewReplies.length
  const displayReplies = showReplies ? allReplies : []
  const hasVisibleReplies = displayReplies.length > 0

  const timeAgoStr = comment.created_at ? timeAgo(comment.created_at) : null

  const handleLike = () => {
    if (!comment.id) return
    const next = !isLiked
    setIsLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    toggleCommentLike(
      { postID: postId, commentID: comment.id },
      {
        onSuccess: (data) => {
          setIsLiked(data.liked)
        },
        onError: () => {
          setIsLiked(!next)
          setLikeCount((c) => c + (next ? -1 : 1))
        },
      },
    )
  }

  return (
    <div className={cn("flex gap-3", depth > 0 ? "pt-3" : "border-border border-b px-4 py-4")}>
      {/* Left: avatar + thread line */}
      <div className="flex shrink-0 flex-col items-center">
        <Avatar
          src={comment.author?.avatar_url}
          name={comment.author?.display_name}
          href={`/@${comment.author?.username}`}
          size="sm"
        />
        {hasVisibleReplies && (
          <div className="bg-border mt-2 w-0.5 flex-1" style={{ minHeight: "16px" }} />
        )}
      </div>

      {/* Right: content + actions + nested replies */}
      <div className="min-w-0 flex-1 pb-1">
        <LinkedUserInfo
          displayName={comment.author?.display_name}
          username={comment.author?.username}
          meta={timeAgoStr}
          size="sm"
        />

        {comment.content && (
          <p className="text-text mt-1 text-sm leading-relaxed whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Actions */}
        <div className="text-text-muted mt-2 flex items-center gap-4">
          <button
            onClick={handleLike}
            aria-label={isLiked ? t("comment.unlike") : t("comment.like")}
            aria-pressed={isLiked}
            className={cn(
              "hover:text-error flex items-center gap-1 text-xs font-medium transition-colors motion-reduce:transition-none",
              isLiked && "text-error",
            )}
          >
            <Icon name={isLiked ? "heart-fill" : "heart"} size={15} aria-hidden="true" />
            {likeCount > 0 && <span aria-hidden="true">{formatCount(likeCount)}</span>}
          </button>

          <button
            onClick={() => setIsReplying((v) => !v)}
            className="hover:text-text flex items-center gap-1 text-xs font-medium transition-colors motion-reduce:transition-none"
          >
            <Icon name="message-circle" size={15} aria-hidden="true" />
            {replyCount > 0 && <span aria-hidden="true">{formatCount(replyCount)}</span>}
          </button>
        </div>

        {/* Inline reply input */}
        {isReplying && (
          <div className="mt-3">
            <CommentInput
              postId={postId}
              parentId={comment.id}
              onSuccess={() => setIsReplying(false)}
            />
          </div>
        )}

        {/* Preview / expanded replies */}
        {hasVisibleReplies && (
          <div className="mt-2">
            {displayReplies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
            ))}
          </div>
        )}

        {/* Reply controls */}
        {replyCount > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {/* View more (only when showing previews and there are more to load) */}
            {showReplies && !showAllReplies && moreCount > 0 && (
              <button
                onClick={() => setShowAllReplies(true)}
                className="text-text-muted hover:text-text w-fit text-xs font-medium transition-colors motion-reduce:transition-none"
              >
                {t("comment.viewMoreReplies", { count: moreCount })}
              </button>
            )}

            {/* Loading indicator */}
            {showReplies && showAllReplies && isLoadingReplies && (
              <div className="text-text-sub flex items-center gap-1.5 text-xs">
                <Spinner size="sm" />
                {t("comment.loadingReplies")}
              </div>
            )}

            {/* Toggle hide / show all replies */}
            <button
              onClick={() => setShowReplies((v) => !v)}
              className="text-text-muted hover:text-text w-fit text-xs font-medium transition-colors motion-reduce:transition-none"
            >
              {showReplies
                ? t("comment.hideReplies")
                : t("comment.viewReplies", { count: replyCount })}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
