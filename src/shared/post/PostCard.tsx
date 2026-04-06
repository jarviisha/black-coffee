import { PostHeader } from "./PostHeader"
import { PostContent } from "./PostContent"
import { PostMedia } from "./PostMedia"
import { PostActions } from "./PostActions"
import { useOptimisticLike } from "./hooks/useOptimisticLike"
import { useOptimisticFollow } from "./hooks/useOptimisticFollow"

// Minimal structural type covering all fields PostCard consumes.
// Both HandlerFeedItemResponse and DtoPostResponse satisfy this shape.
type PostCardItem = {
  id?: string
  content?: string
  created_at?: string
  comment_count?: number
  is_following_author?: boolean
  is_liked?: boolean
  like_count?: number
  media?: { id?: string; media_type?: string; position?: number; url?: string }[]
  author?: { id?: string; avatar_url?: string; display_name?: string; username?: string }
}

interface PostCardProps {
  post: PostCardItem
}

export function PostCard({ post }: PostCardProps) {
  const { liked, likeCount, handleLike } = useOptimisticLike({
    postId: post.id,
    initialLiked: post.is_liked,
    initialCount: post.like_count,
  })
  const {
    showFollow,
    isPending: isFollowPending,
    handleFollow,
  } = useOptimisticFollow({
    authorId: post.author?.id,
    initialFollowing: post.is_following_author,
  })

  return (
    <article className="border-border border-b p-4 transition-colors motion-reduce:transition-none">
      <PostHeader
        author={post.author}
        createdAt={post.created_at}
        showFollow={showFollow}
        isFollowPending={isFollowPending}
        onFollow={handleFollow}
      />

      {post.content && post.id && <PostContent content={post.content} postId={post.id} />}

      {post.media && post.media.length > 0 && <PostMedia media={post.media} />}

      <PostActions
        postId={post.id}
        liked={liked}
        likeCount={likeCount}
        commentCount={post.comment_count ?? 0}
        createdAt={post.created_at}
        onLike={handleLike}
      />
    </article>
  )
}
