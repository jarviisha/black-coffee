import { useTranslation } from "react-i18next"
import { useThemeStore, type Theme } from "@/store/themeStore"
import { LANGUAGES, type Language } from "@/lib/i18n"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Icon } from "@/components/ui/Icon"
import * as Menu from "@/components/ui/Menu"
import { cn } from "@/lib/utils"

interface UserMenuPanelProps {
  menuRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
}

const THEME_OPTIONS: { value: Theme; labelKey: "nav.lightMode" | "nav.darkMode"; icon: string }[] =
  [
    { value: "light", labelKey: "nav.lightMode", icon: "sun" },
    { value: "dark", labelKey: "nav.darkMode", icon: "moon" },
  ]

export function UserMenuPanel({ menuRef, onClose }: UserMenuPanelProps) {
  const { t, i18n } = useTranslation()
  const { logout } = useAuth()
  const { theme, setTheme } = useThemeStore()

  const handleLogout = () => {
    onClose()
    logout()
  }

  const submenuItemClass = "px-3 py-2.5 text-sm"

  return (
    <div ref={menuRef} className="absolute right-0 bottom-full z-50 mb-2 w-60">
      <Menu.Root>
        <Menu.Content>
          {/* Privacy settings */}
          <Menu.Item
            onClick={onClose}
            leftIcon={<Icon name="lock" size={16} aria-hidden="true" />}
            className="rounded-b-none"
          >
            {t("nav.privacySettings")}
          </Menu.Item>

          <Menu.Separator />

          {/* Language — submenu */}
          <Menu.Sub value="language">
            <Menu.SubTrigger
              leftIcon={<Icon name="language" size={16} aria-hidden="true" />}
              rightIcon={<Icon name="chevron-right" size={14} aria-hidden="true" />}
            >
              {t("nav.language")}
            </Menu.SubTrigger>

            <Menu.SubContent>
              {(Object.entries(LANGUAGES) as [Language, (typeof LANGUAGES)[Language]][]).map(
                ([code, { label, nativeLabel }]) => (
                  <Menu.Item
                    key={code}
                    onClick={() => void i18n.changeLanguage(code)}
                    aria-current={i18n.language === code ? "true" : undefined}
                    rightIcon={
                      i18n.language === code ? (
                        <Icon name="check" size={14} className="text-accent" aria-hidden="true" />
                      ) : undefined
                    }
                    className={cn(
                      submenuItemClass,
                      i18n.language === code && "text-text font-bold",
                    )}
                  >
                    <span className="flex flex-col items-start">
                      <span>{label}</span>
                      <span className="text-text-sub text-xs">{nativeLabel}</span>
                    </span>
                  </Menu.Item>
                ),
              )}
            </Menu.SubContent>
          </Menu.Sub>

          {/* Theme — submenu */}
          <Menu.Sub value="theme">
            <Menu.SubTrigger
              leftIcon={
                <Icon name={theme === "dark" ? "moon" : "sun"} size={16} aria-hidden="true" />
              }
              rightIcon={<Icon name="chevron-right" size={14} aria-hidden="true" />}
            >
              {t("nav.theme")}
            </Menu.SubTrigger>

            <Menu.SubContent>
              {THEME_OPTIONS.map(({ value, labelKey, icon }) => (
                <Menu.Item
                  key={value}
                  onClick={() => setTheme(value)}
                  leftIcon={<Icon name={icon} size={16} aria-hidden="true" />}
                  rightIcon={
                    theme === value ? (
                      <Icon name="check" size={14} className="text-accent" aria-hidden="true" />
                    ) : undefined
                  }
                  aria-current={theme === value ? "true" : undefined}
                  className={cn(submenuItemClass, theme === value && "text-text font-bold")}
                >
                  {t(labelKey)}
                </Menu.Item>
              ))}
            </Menu.SubContent>
          </Menu.Sub>

          <Menu.Separator />

          {/* Logout */}
          <Menu.Item
            color="danger"
            onClick={handleLogout}
            leftIcon={<Icon name="logout" size={16} aria-hidden="true" />}
            className="rounded-t-none"
          >
            {t("nav.logout")}
          </Menu.Item>
        </Menu.Content>
      </Menu.Root>
    </div>
  )
}
