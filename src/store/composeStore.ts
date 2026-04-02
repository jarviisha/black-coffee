import { create } from "zustand"

interface ComposeStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useComposeStore = create<ComposeStore>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
