import type { KeyboardEvent, KeyboardEventHandler } from "react"

/**
 * Arrow navigation for a role="menu". Tab alone walks the items, but a menu is
 * expected to answer the arrow keys, and a submenu that only opens on
 * hover/focus needs them to be reachable at all.
 *
 * Shared by Content and SubContent: an open submenu is its own menu, so it must
 * consume these keys before they bubble to the parent, which cannot locate a
 * focused item that isn't its own.
 */
export function createMenuKeyNav(onKeyDown?: KeyboardEventHandler<HTMLDivElement>) {
  return (e: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return

    // Submenu triggers sit inside a wrapper div, so a direct-child selector
    // would miss them; closest() keeps out the items of an open submenu.
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]')].filter(
      (el) => el.closest('[role="menu"]') === e.currentTarget,
    )
    if (items.length === 0) return

    const last = items.length - 1
    const current = items.indexOf(document.activeElement as HTMLElement)
    let next: number
    switch (e.key) {
      case "Home":
        next = 0
        break
      case "End":
        next = last
        break
      case "ArrowDown":
        next = current === last ? 0 : current + 1
        break
      case "ArrowUp":
        next = current <= 0 ? last : current - 1
        break
      default:
        return
    }

    e.preventDefault()
    e.stopPropagation()
    items[next].focus()
  }
}
