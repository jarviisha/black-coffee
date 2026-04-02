import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { timeAgo, formatDateTime } from "@/lib/utils"
import Icon from "@/components/ui/Icon"
import { Avatar } from "@/components/ui/Avatar"
import { LinkedUserInfo } from "@/components/ui/UserInfo"
import { PostMedia } from "./PostMedia"
import { useToggleLike } from "@/api/hooks/useToggleLike"
import { ButtonIcon } from "@/components/ui/Button"

// Minimal structural type covering all fields PostCard consumes.
// Both HandlerFeedItemResponse and DtoPostResponse satisfy this shape.
type PostCardItem = {
  id: string
  content?: string
  created_at?: string
  comment_count?: number
  is_liked?: boolean
  like_count?: number
  media?: { id?: string; media_type?: string; position?: number; url?: string }[]
  author?: { id?: string; avatar_url?: string; display_name?: string; username?: string }
}

const MENTION_HASHTAG_RE = /([@#][\w]+)/g

function PostContent({ content, postId }: { content: string; postId: string }) {
  const navigate = useNavigate()
  const parts = content.split(MENTION_HASHTAG_RE)

  return (
    <div className="cursor-pointer py-3" onClick={() => void navigate(`/post/${postId}`)}>
      <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.startsWith("@")) {
            return (
              <Link
                key={i}
                to={`/@${part.slice(1)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-mention hover:bg-mention-bg rounded-sm px-0.5 font-medium transition-colors hover:underline motion-reduce:transition-none"
              >
                {part}
              </Link>
            )
          }
          if (part.startsWith("#")) {
            return (
              <span
                key={i}
                role="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void navigate(`/discover?tag=${part.slice(1)}`)
                }}
                className="text-hashtag hover:bg-hashtag-bg cursor-pointer rounded-sm px-0.5 font-medium transition-colors hover:underline motion-reduce:transition-none"
              >
                {part}
              </span>
            )
          }
          return part
        })}
      </p>
    </div>
  )
}

function formatCount(n: number): string {
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

interface PostCardProps {
  post: PostCardItem
}

export function PostCard({ post }: PostCardProps) {
  const { t } = useTranslation()
  const [liked, setLiked] = useState(post.is_liked ?? false)
  const [likeCount, setLikeCount] = useState(post.like_count ?? 0)
  const { mutate: toggleLike } = useToggleLike()

  const handleLike = () => {
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    toggleLike(
      { postID: post.id },
      {
        onError: () => {
          setLiked(!next)
          setLikeCount((c) => c + (next ? -1 : 1))
        },
      },
    )
  }

  const timeAgoStr = post.created_at ? timeAgo(post.created_at) : null

  return (
    <article className="border-border border-b p-4 transition-colors motion-reduce:transition-none">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar
          src={post.author?.avatar_url}
          name={post.author?.display_name}
          href={`/@${post.author?.username}`}
        />
        <LinkedUserInfo
          displayName={post.author?.display_name}
          username={post.author?.username}
          meta={timeAgoStr}
        />
      </div>

      {/* Content */}
      {post.content && <PostContent content={post.content} postId={post.id} />}

      {/* Media */}
      {post.media && post.media.length > 0 && <PostMedia media={post.media} />}

      {/* Actions */}
      <div className="text-text-muted flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div
            aria-pressed={liked}
            className={`hover:text-like flex items-center gap-1.5 text-xs font-bold transition-colors motion-reduce:transition-none ${liked ? "text-like" : ""}`}
          >
            <ButtonIcon
              onClick={handleLike}
              name={liked ? "heart-fill" : "heart"}
              iconSize={20}
              aria-label={liked ? t("post.unlike") : t("post.like")}
            />
            <span aria-hidden="true" className="cursor-pointer hover:underline">
              {formatCount(likeCount)}
            </span>
          </div>

          <Link
            to={`/post/${post.id}`}
            aria-label={t("post.comments", { count: post.comment_count ?? 0 })}
            className="hover:text-text flex items-center gap-1.5 text-xs font-bold transition-colors motion-reduce:transition-none"
          >
            <Icon name="message-circle" size={20} />
            <span aria-hidden="true">{formatCount(post.comment_count ?? 0)}</span>
          </Link>
        </div>

        {post.created_at && (
          <time dateTime={post.created_at} className="text-text-sub text-xs">
            {formatDateTime(post.created_at)}
          </time>
        )}
      </div>
    </article>
  )
}
