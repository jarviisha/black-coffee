import { create } from "zustand"

interface ComposeStore {
  isOpen: boolean
  /**
   * Timestamp of the last successful post. Lists that accumulate pages locally
   * watch this to rebuild themselves from a fresh first page, so a new post is
   * visible without a reload.
   */
  postedAt: number | undefined
  open: () => void
  close: () => void
  markPosted: () => void
}

export const useComposeStore = create<ComposeStore>()((set) => ({
  isOpen: false,
  postedAt: undefined,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  markPosted: () => set({ postedAt: Date.now() }),
}))
