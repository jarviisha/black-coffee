import { useState, useRef, useEffect } from "react"

const ENTRY_KEYS = ["ArrowDown", "ArrowUp", "Home", "End"]
const FOCUSABLE = '[role="menuitem"], button:not([disabled]), a[href]'

export function useDropdown() {
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
    const onKeyDown = (e: KeyboardEvent) => {
      // Escape is the expected way out of an open popup; without it the only way
      // to dismiss is a pointer, which strands keyboard users inside the menu.
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (!ENTRY_KEYS.includes(e.key)) return
      const panel = panelRef.current
      // Once focus is inside, the panel owns arrow navigation. This only covers
      // the first press, when focus is still on the trigger that opened it.
      if (!panel || panel.contains(document.activeElement)) return

      const items = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (items.length === 0) return
      e.preventDefault()
      const fromBottom = e.key === "ArrowUp" || e.key === "End"
      items[fromBottom ? items.length - 1 : 0].focus()
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return { open, setOpen, panelRef, triggerRef }
}
