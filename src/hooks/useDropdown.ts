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
      // The listener is on document, so anything it acts on must belong to this
      // dropdown. Tab away and these keys are the page's again.
      const active = document.activeElement
      const onTrigger = triggerRef.current?.contains(active) ?? false
      const insidePanel = panelRef.current?.contains(active) ?? false
      if (!onTrigger && !insidePanel) return

      // Escape is the expected way out of an open popup; without it the only way
      // to dismiss is a pointer, which strands keyboard users inside the menu.
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }

      // Once focus is inside, the panel owns arrow navigation. This only covers
      // the first press, when focus is still on the trigger that opened it.
      if (!ENTRY_KEYS.includes(e.key) || insidePanel) return

      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (!items || items.length === 0) return
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
