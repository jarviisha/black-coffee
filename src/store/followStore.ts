import { create } from "zustand"

type FollowState = {
  /** Author IDs optimistically followed during this session */
  followedIds: Set<string>
  markFollowed: (authorId: string) => void
  unmarkFollowed: (authorId: string) => void
}

export const useFollowStore = create<FollowState>()((set) => ({
  followedIds: new Set(),
  markFollowed: (authorId) => set((s) => ({ followedIds: new Set(s.followedIds).add(authorId) })),
  unmarkFollowed: (authorId) =>
    set((s) => {
      const next = new Set(s.followedIds)
      next.delete(authorId)
      return { followedIds: next }
    }),
}))
