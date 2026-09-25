import { useFollowUser } from "@/api/hooks/useFollowUser"
import { useAuthStore } from "@/store/authStore"
import { useFollowStore } from "@/store/followStore"

interface UseOptimisticFollowOptions {
  authorId?: string
  initialFollowing?: boolean
}

export function useOptimisticFollow({ authorId, initialFollowing }: UseOptimisticFollowOptions) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const override = useFollowStore((s) => (authorId ? s.overrides[authorId] : undefined))
  const setFollowing = useFollowStore((s) => s.setFollowing)
  const { mutate: followUser, isPending } = useFollowUser()

  // A session override always wins over the flag baked into the post payload.
  const isFollowing = override ?? initialFollowing ?? false
  const isOwnPost = !!currentUserId && currentUserId === authorId
  const showFollow = !isOwnPost && !isFollowing

  const handleFollow = () => {
    if (!authorId || isPending) return
    setFollowing(authorId, true)
    followUser({ userKey: authorId }, { onError: () => setFollowing(authorId, false) })
  }

  return { showFollow, isPending, handleFollow }
}
