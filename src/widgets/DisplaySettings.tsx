import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useThemeStore, type Theme } from "@/store/themeStore"
import { LANGUAGES, type Language } from "@/lib/i18n"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { cn } from "@/lib/utils"

const THEME_OPTIONS: { value: Theme; labelKey: "nav.lightMode" | "nav.darkMode"; icon: string }[] =
  [
    { value: "light", labelKey: "nav.lightMode", icon: "sun" },
    { value: "dark", labelKey: "nav.darkMode", icon: "moon" },
  ]

function useDropdown() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (
        !panelRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  return { open, setOpen, panelRef, triggerRef }
}

const dropdownClass =
  "bg-bg border-border absolute top-full right-0 mt-1.5 w-40 overflow-hidden rounded border shadow-lg z-10"
const itemClass =
  "h-auto w-full justify-start rounded-none px-3 py-2 font-normal text-sm first:rounded-t last:rounded-b"

export function LanguageDropdown() {
  const { i18n } = useTranslation()
  const { open, setOpen, panelRef, triggerRef } = useDropdown()
  const currentLang = LANGUAGES[i18n.language as Language]

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="solid"
        color="muted"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        rightIcon={<Icon name="chevron-down" size={12} aria-hidden="true" />}
        className={cn(
          "h-auto gap-1 px-2.5 py-1.5 text-xs font-medium",
          open && "bg-surface-hi text-text",
        )}
      >
        {currentLang?.label ?? i18n.language.toUpperCase()}
      </Button>

      {open && (
        <div ref={panelRef} className={dropdownClass}>
          {(Object.entries(LANGUAGES) as [Language, (typeof LANGUAGES)[Language]][]).map(
            ([code, { label, nativeLabel }]) => (
              <Button
                key={code}
                variant="ghost"
                color="muted"
                onClick={() => {
                  void i18n.changeLanguage(code)
                  setOpen(false)
                }}
                aria-current={i18n.language === code ? "true" : undefined}
                rightIcon={
                  i18n.language === code ? (
                    <Icon name="check" size={13} className="text-accent" aria-hidden="true" />
                  ) : undefined
                }
                className={cn(itemClass, i18n.language === code && "text-text")}
              >
                <span className="flex flex-col items-start">
                  <span>{label}</span>
                  <span className="text-text-sub text-[10px]">{nativeLabel}</span>
                </span>
              </Button>
            ),
          )}
        </div>
      )}
    </div>
  )
}

export function ThemeDropdown() {
  const { t } = useTranslation()
  const { theme, setTheme } = useThemeStore()
  const { open, setOpen, panelRef, triggerRef } = useDropdown()

  const current = THEME_OPTIONS.find((o) => o.value === theme)

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="solid"
        color="muted"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        leftIcon={<Icon name={current?.icon ?? "sun"} size={14} aria-hidden="true" />}
        rightIcon={<Icon name="chevron-down" size={12} aria-hidden="true" />}
        className={cn(
          "h-auto gap-1 px-2.5 py-1.5 text-xs font-medium",
          open && "bg-surface-hi text-text",
        )}
      >
        {t(current?.labelKey ?? "nav.lightMode")}
      </Button>

      {open && (
        <div ref={panelRef} className={dropdownClass}>
          {THEME_OPTIONS.map(({ value, labelKey, icon }) => (
            <Button
              key={value}
              variant="ghost"
              color="muted"
              onClick={() => {
                setTheme(value)
                setOpen(false)
              }}
              leftIcon={<Icon name={icon} size={14} aria-hidden="true" />}
              rightIcon={
                theme === value ? (
                  <Icon name="check" size={13} className="text-accent" aria-hidden="true" />
                ) : undefined
              }
              aria-current={theme === value ? "true" : undefined}
              className={cn(itemClass, theme === value && "text-text")}
            >
              {t(labelKey)}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
