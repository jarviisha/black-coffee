import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DtoUserResponse } from "@/api/models/dto/UserResponse"

type AuthState = {
  accessToken: string | null
  user: DtoUserResponse | null
  /** true after auth initialization is complete (refresh succeeded or failed) */
  isInitialized: boolean
}

type AuthActions = {
  setTokens: (accessToken: string) => void
  setUser: (user: DtoUserResponse) => void
  setInitialized: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isInitialized: false,

      setTokens: (accessToken) => set({ accessToken }),
      setUser: (user) => set({ user }),
      setInitialized: () => set({ isInitialized: true }),
      logout: () => set({ accessToken: null, user: null, isInitialized: true }),
    }),
    {
      name: "auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
)
