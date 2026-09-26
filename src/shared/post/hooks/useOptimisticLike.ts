import { useState, useCallback } from "react"
import { toast } from "sonner"
import { useTranslation } from "react-i18next"
import { useToggleLike } from "@/api/hooks/useToggleLike"
import { useAuthStore } from "@/store/authStore"
import { apiErrorMessage } from "@/lib/utils"

interface UseOptimisticLikeOptions {
  postId?: string
  authorId?: string
  initialLiked?: boolean
  initialCount?: number
}

export function useOptimisticLike({
  postId,
  authorId,
  initialLiked = false,
  initialCount = 0,
}: UseOptimisticLikeOptions) {
  const { t } = useTranslation()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const { mutate: toggleLike } = useToggleLike()

  // The server rejects liking your own post, so the action is not offered.
  const canLike = !currentUserId || currentUserId !== authorId

  const handleLike = useCallback(() => {
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    if (!postId) return
    toggleLike(
      { postID: postId },
      {
        onError: (err) => {
          setLiked(!next)
          setLikeCount((c) => c + (next ? -1 : 1))
          // Without this the heart just flips back on its own, which reads as a bug.
          toast.error(apiErrorMessage(err, t("common.error"), { SELF_LIKE: t("post.selfLike") }))
        },
      },
    )
  }, [postId, liked, toggleLike, t])

  return { liked, likeCount, canLike, handleLike }
}
