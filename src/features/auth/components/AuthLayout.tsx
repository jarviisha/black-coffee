import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { brand } from "@/config/brand"
import { LanguageDropdown, ThemeDropdown } from "@/widgets/DisplaySettings"

interface AuthLayoutProps {
  /** Changing this replays the enter animation — pass the route path */
  transitionKey: string
  children: ReactNode
}

export function AuthLayout({ transitionKey, children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-bg flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-2 px-6 py-4">
        <span className="text-text flex items-center gap-2 text-sm font-semibold">
          <Icon name={brand.logo} size={18} />
          {brand.name}
        </span>
        <div className="flex items-center gap-2">
          <LanguageDropdown />
          <ThemeDropdown />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div
          key={transitionKey}
          className="animate-auth-enter w-full max-w-100 motion-reduce:animate-none"
        >
          {children}
        </div>
      </main>

      <footer className="text-text-muted px-6 py-4 text-center text-xs">
        {t("common.copyright", { year: new Date().getFullYear(), brand: brand.name })}
      </footer>
    </div>
  )
}
