import { useFollowUser } from "@/api/hooks/useFollowUser"
import { useAuthStore } from "@/store/authStore"
import { useFollowStore } from "@/store/followStore"

interface UseOptimisticFollowOptions {
  authorId?: string
  initialFollowing?: boolean
}

export function useOptimisticFollow({ authorId, initialFollowing }: UseOptimisticFollowOptions) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const followedIds = useFollowStore((s) => s.followedIds)
  const markFollowed = useFollowStore((s) => s.markFollowed)
  const unmarkFollowed = useFollowStore((s) => s.unmarkFollowed)
  const { mutate: followUser, isPending } = useFollowUser()

  const isFollowing = (authorId && followedIds.has(authorId)) || initialFollowing || false
  const isOwnPost = !!currentUserId && currentUserId === authorId
  const showFollow = !isOwnPost && !isFollowing

  const handleFollow = () => {
    if (!authorId || isPending) return
    markFollowed(authorId)
    followUser({ userKey: authorId }, { onError: () => unmarkFollowed(authorId) })
  }

  return { showFollow, isPending, handleFollow }
}
