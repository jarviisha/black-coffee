import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useThemeStore, type Theme } from "@/store/themeStore"
import { LANGUAGES, type Language } from "@/lib/i18n"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

interface UserMenuPanelProps {
  menuRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
}

type Submenu = "language" | "theme" | null

const THEME_OPTIONS: { value: Theme; labelKey: "nav.lightMode" | "nav.darkMode"; icon: string }[] =
  [
    { value: "light", labelKey: "nav.lightMode", icon: "sun" },
    { value: "dark", labelKey: "nav.darkMode", icon: "moon" },
  ]

export function UserMenuPanel({ menuRef, onClose }: UserMenuPanelProps) {
  const { t, i18n } = useTranslation()
  const { logout } = useAuth()
  const { theme, setTheme } = useThemeStore()

  const [openSubmenu, setOpenSubmenu] = useState<Submenu>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openSub = (name: Submenu) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenSubmenu(name)
  }

  const closeSub = () => {
    closeTimer.current = setTimeout(() => setOpenSubmenu(null), 120)
  }

  const handleLogout = () => {
    onClose()
    logout()
  }

  const menuItemClass = "h-auto w-full justify-start rounded-none px-4 py-3 font-normal"
  const submenuItemClass =
    "h-auto w-full justify-start rounded-none px-3 py-2.5 font-normal text-sm"

  return (
    <div
      ref={menuRef}
      role="menu"
      className="bg-bg border-border absolute right-0 bottom-full mb-2 w-60 rounded border shadow-lg"
    >
      {/* Privacy settings */}
      <Button
        role="menuitem"
        variant="ghost"
        color="muted"
        onClick={onClose}
        leftIcon={<Icon name="lock" size={16} aria-hidden="true" />}
        className={cn(menuItemClass, "rounded-b-md-none rounded-t-md")}
      >
        {t("nav.privacySettings")}
      </Button>

      <div className="border-border border-t" />

      {/* Language — submenu */}
      <div className="relative" onMouseEnter={() => openSub("language")} onMouseLeave={closeSub}>
        <Button
          role="menuitem"
          variant="ghost"
          color="muted"
          leftIcon={<Icon name="globe" size={16} aria-hidden="true" />}
          rightIcon={<Icon name="chevron-right" size={14} aria-hidden="true" />}
          aria-haspopup="menu"
          aria-expanded={openSubmenu === "language"}
          className={cn(
            menuItemClass,
            "rounded-none",
            openSubmenu === "language" && "bg-surface-hi text-text",
          )}
        >
          {t("nav.language")}
        </Button>

        {openSubmenu === "language" && (
          <div
            role="menu"
            onMouseEnter={() => openSub("language")}
            onMouseLeave={closeSub}
            className="bg-bg border-border absolute top-0 left-full w-44 overflow-hidden rounded border shadow-lg"
          >
            {(Object.entries(LANGUAGES) as [Language, (typeof LANGUAGES)[Language]][]).map(
              ([code, { label, nativeLabel }]) => (
                <Button
                  key={code}
                  role="menuitem"
                  variant="ghost"
                  color="muted"
                  onClick={() => void i18n.changeLanguage(code)}
                  aria-current={i18n.language === code ? "true" : undefined}
                  rightIcon={
                    i18n.language === code ? (
                      <Icon name="check" size={14} className="text-accent" aria-hidden="true" />
                    ) : undefined
                  }
                  className={cn(
                    submenuItemClass,
                    "first:rounded-t-md last:rounded-b-md",
                    i18n.language === code && "text-text",
                  )}
                >
                  <span className="flex flex-col items-start">
                    <span>{label}</span>
                    <span className="text-text-sub text-xs">{nativeLabel}</span>
                  </span>
                </Button>
              ),
            )}
          </div>
        )}
      </div>

      {/* Theme — submenu */}
      <div className="relative" onMouseEnter={() => openSub("theme")} onMouseLeave={closeSub}>
        <Button
          role="menuitem"
          variant="ghost"
          color="muted"
          leftIcon={<Icon name={theme === "dark" ? "moon" : "sun"} size={16} aria-hidden="true" />}
          rightIcon={<Icon name="chevron-right" size={14} aria-hidden="true" />}
          aria-haspopup="menu"
          aria-expanded={openSubmenu === "theme"}
          className={cn(
            menuItemClass,
            "rounded-none",
            openSubmenu === "theme" && "bg-surface-hi text-text",
          )}
        >
          {t("nav.theme")}
        </Button>

        {openSubmenu === "theme" && (
          <div
            role="menu"
            onMouseEnter={() => openSub("theme")}
            onMouseLeave={closeSub}
            className="bg-bg border-border absolute top-0 left-full w-44 overflow-hidden rounded border shadow-lg"
          >
            {THEME_OPTIONS.map(({ value, labelKey, icon }) => (
              <Button
                key={value}
                role="menuitem"
                variant="ghost"
                color="muted"
                onClick={() => setTheme(value)}
                leftIcon={<Icon name={icon} size={16} aria-hidden="true" />}
                rightIcon={
                  theme === value ? (
                    <Icon name="check" size={14} className="text-accent" aria-hidden="true" />
                  ) : undefined
                }
                aria-current={theme === value ? "true" : undefined}
                className={cn(
                  submenuItemClass,
                  "first:rounded-t-md last:rounded-b-md",
                  theme === value && "text-text",
                )}
              >
                {t(labelKey)}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="border-border border-t" />

      {/* Logout */}
      <Button
        role="menuitem"
        variant="ghost"
        color="danger"
        onClick={handleLogout}
        leftIcon={<Icon name="log-out" size={16} aria-hidden="true" />}
        className={cn(menuItemClass, "rounded-t-md-none rounded-b-md")}
      >
        {t("nav.logout")}
      </Button>
    </div>
  )
}
