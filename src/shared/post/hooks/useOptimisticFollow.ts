import { useState } from "react"
import { useFollowUser } from "@/api/hooks/useFollowUser"
import { useAuthStore } from "@/store/authStore"

interface UseOptimisticFollowOptions {
  authorId?: string
  initialFollowing?: boolean
}

export function useOptimisticFollow({ authorId, initialFollowing }: UseOptimisticFollowOptions) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [optimistic, setOptimistic] = useState<boolean | null>(null)
  const { mutate: followUser, isPending } = useFollowUser()

  const isFollowing = optimistic ?? initialFollowing ?? false
  const isOwnPost = !!currentUserId && currentUserId === authorId
  const showFollow = !isOwnPost && !isFollowing

  const handleFollow = () => {
    if (!authorId || isPending) return
    setOptimistic(true)
    followUser({ userKey: authorId }, { onError: () => setOptimistic(false) })
  }

  return { showFollow, isPending, handleFollow }
}
