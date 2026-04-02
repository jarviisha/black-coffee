import { useState, useRef, useEffect } from "react"
import ReactEmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react"
import Icon from "./Icon"
import { useThemeStore } from "@/store/themeStore"

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
  triggerLabel: string
}

export function EmojiPicker({ onSelect, triggerLabel }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const theme = useThemeStore((s) => s.theme)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleEmojiClick = (data: EmojiClickData) => {
    onSelect(data.emoji)
    setOpen(false)
  }

  return (
    <div ref={ref} className="text-text-muted relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={triggerLabel}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Icon name="smile" size={20} aria-hidden="true" />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-1">
          <ReactEmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
            lazyLoadEmojis
            searchDisabled={false}
            skinTonesDisabled
            width={440}
            height={360}
          />
        </div>
      )}
    </div>
  )
}
