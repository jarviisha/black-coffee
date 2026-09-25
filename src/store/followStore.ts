import { create } from "zustand"

type FollowState = {
  /**
   * Follow state changed during this session, keyed by user ID.
   *
   * Fetched payloads carry their own follow flags (`is_following` on a profile,
   * `is_following_author` on a post), but those are snapshots taken when the
   * request was made. Following someone in one place — the profile header, a
   * post card in the feed — does not refetch the others, so every view showing
   * a follow control must read this store first and fall back to the payload.
   */
  overrides: Record<string, boolean>
  setFollowing: (userId: string, isFollowing: boolean) => void
}

export const useFollowStore = create<FollowState>()((set) => ({
  overrides: {},
  setFollowing: (userId, isFollowing) =>
    set((s) => ({ overrides: { ...s.overrides, [userId]: isFollowing } })),
}))
