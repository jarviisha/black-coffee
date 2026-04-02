import { useState, useRef, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/Icon"
import { VISIBILITY_OPTIONS, type Visibility } from "../schemas"

const VISIBILITY_ICON: Record<Visibility, string> = {
  public: "world",
  followers: "user",
  private: "lock",
}

interface VisibilitySelectorProps {
  value: Visibility
  onChange: (v: Visibility) => void
}

export function VisibilitySelector({ value, onChange }: VisibilitySelectorProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5"
      >
        <Icon name={VISIBILITY_ICON[value] ?? "globe"} size={16} aria-hidden="true" />
        <span className="text-xs font-bold">{t(`compose.visibility.${value}`)}</span>
        <Icon name="chevron-down" size={14} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label={t("compose.visibility.label")}
          className="bg-surface border-border absolute bottom-full left-0 mb-1 w-36 overflow-hidden rounded border shadow-md"
        >
          {VISIBILITY_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              onMouseDown={(e) => {
                e.preventDefault()
                onChange(opt)
                setOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-2 px-3 py-2 text-xs transition-colors motion-reduce:transition-none",
                value === opt
                  ? "text-accent"
                  : "text-text-muted hover:bg-surface-hi hover:text-text",
              )}
            >
              <Icon name={VISIBILITY_ICON[opt]} size={13} aria-hidden="true" />
              {t(`compose.visibility.${opt}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
