import { useState, useCallback } from "react"
import { useToggleLike } from "@/api/hooks/useToggleLike"

interface UseOptimisticLikeOptions {
  postId?: string
  initialLiked?: boolean
  initialCount?: number
}

export function useOptimisticLike({
  postId,
  initialLiked = false,
  initialCount = 0,
}: UseOptimisticLikeOptions) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const { mutate: toggleLike } = useToggleLike()

  const handleLike = useCallback(() => {
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    if (!postId) return
    toggleLike(
      { postID: postId },
      {
        onError: () => {
          setLiked(!next)
          setLikeCount((c) => c + (next ? -1 : 1))
        },
      },
    )
  }, [postId, liked, toggleLike])

  return { liked, likeCount, handleLike }
}
