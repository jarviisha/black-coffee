import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Theme = "light" | "dark" | "system"

type ThemeState = {
  theme: Theme
  toggle: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggle: () =>
        set((s) => {
          const effective =
            s.theme === "system"
              ? window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light"
              : s.theme
          return { theme: effective === "dark" ? "light" : "dark" }
        }),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "theme" },
  ),
)
