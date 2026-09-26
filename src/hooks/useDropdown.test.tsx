import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { useDropdown } from "./useDropdown"

/** Mirrors UserCard: the trigger sits outside the panel and keeps focus on click. */
function DropdownHarness() {
  const { open, setOpen, panelRef, triggerRef } = useDropdown()

  return (
    <div>
      <button ref={triggerRef} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Open menu
      </button>
      {open && (
        <div ref={panelRef}>
          <div role="menu">
            <button role="menuitem">First</button>
            <button role="menuitem">Second</button>
            <button role="menuitem">Last</button>
          </div>
        </div>
      )}
    </div>
  )
}

/** An unrelated field on the same page — the dropdown must keep its hands off it. */
function DropdownWithSibling() {
  const { open, setOpen, panelRef, triggerRef } = useDropdown()

  return (
    <div>
      <input aria-label="Email" />
      <button ref={triggerRef} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Open menu
      </button>
      {open && (
        <div ref={panelRef}>
          <div role="menu">
            <button role="menuitem">First</button>
            <button role="menuitem">Last</button>
          </div>
        </div>
      )}
    </div>
  )
}

describe("useDropdown", () => {
  it("closes on Escape and hands focus back to the trigger", async () => {
    const user = userEvent.setup()
    render(<DropdownHarness />)

    await user.click(screen.getByRole("button", { name: "Open menu" }))
    expect(screen.getByRole("menu")).toBeInTheDocument()

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus()
  })

  // Clicking the trigger leaves focus on the trigger, which is outside the
  // panel — so the panel's own key handler never sees the first arrow press.
  it("moves focus to the first item on ArrowDown while focus is still on the trigger", async () => {
    const user = userEvent.setup()
    render(<DropdownHarness />)

    await user.click(screen.getByRole("button", { name: "Open menu" }))
    await user.keyboard("{ArrowDown}")

    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus()
  })

  it("enters from the bottom on ArrowUp and End", async () => {
    const user = userEvent.setup()
    render(<DropdownHarness />)

    await user.click(screen.getByRole("button", { name: "Open menu" }))
    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("menuitem", { name: "Last" })).toHaveFocus()

    await user.keyboard("{Escape}")
    await user.click(screen.getByRole("button", { name: "Open menu" }))
    await user.keyboard("{End}")
    expect(screen.getByRole("menuitem", { name: "Last" })).toHaveFocus()
  })

  it("leaves navigation to the panel once focus is inside it", async () => {
    const user = userEvent.setup()
    render(<DropdownHarness />)

    await user.click(screen.getByRole("button", { name: "Open menu" }))
    screen.getByRole("menuitem", { name: "Second" }).focus()
    await user.keyboard("{ArrowDown}")

    // No panel handler in this harness, so focus must stay where it was rather
    // than being yanked back to the first item by the entry shortcut.
    expect(screen.getByRole("menuitem", { name: "Second" })).toHaveFocus()
  })

  // The listener is on document, so without a focus guard an open dropdown
  // swallows keys that belong to whatever the user is actually typing in.
  it("leaves keys alone when focus has moved to an unrelated field", async () => {
    const user = userEvent.setup()
    render(<DropdownWithSibling />)

    await user.click(screen.getByRole("button", { name: "Open menu" }))
    const email = screen.getByRole("textbox", { name: "Email" })
    email.focus()

    await user.keyboard("{End}")
    expect(email).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(email).toHaveFocus()

    await user.keyboard("{Escape}")
    expect(email).toHaveFocus()
  })
})
