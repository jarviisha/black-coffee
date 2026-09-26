import { create } from "zustand"

interface ComposeStore {
  isOpen: boolean
  /**
   * Timestamp of the last successful post. Cursor-paginated lists watch this
   * to rewind to page one, where the new post is — see useRewindOnPost.
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
