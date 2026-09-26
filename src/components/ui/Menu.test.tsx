import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import * as Menu from "./Menu"

function TestMenu() {
  return (
    <Menu.Root>
      <Menu.Content>
        <Menu.Item>First</Menu.Item>
        <Menu.Item>Second</Menu.Item>
        <Menu.Item>Third</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  )
}

/** Mirrors UserMenuPanel: a submenu trigger is nested, not a direct child. */
function NestedMenu() {
  return (
    <Menu.Root>
      <Menu.Content>
        <Menu.Sub value="theme">
          <Menu.SubTrigger>Theme</Menu.SubTrigger>
          <Menu.SubContent>
            <Menu.Item>Light</Menu.Item>
            <Menu.Item>Dark</Menu.Item>
          </Menu.SubContent>
        </Menu.Sub>
        <Menu.Item>Log out</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  )
}

describe("Menu keyboard navigation", () => {
  it("moves focus down the items with ArrowDown", async () => {
    const user = userEvent.setup()
    render(<TestMenu />)

    await user.tab()
    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Second" })).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Third" })).toHaveFocus()
  })

  it("wraps from the last item back to the first", async () => {
    const user = userEvent.setup()
    render(<TestMenu />)

    screen.getByRole("menuitem", { name: "Third" }).focus()
    await user.keyboard("{ArrowDown}")

    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus()
  })

  it("moves back up with ArrowUp and wraps to the last item", async () => {
    const user = userEvent.setup()
    render(<TestMenu />)

    screen.getByRole("menuitem", { name: "Second" }).focus()
    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus()

    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("menuitem", { name: "Third" })).toHaveFocus()
  })

  it("jumps to the first and last item with Home and End", async () => {
    const user = userEvent.setup()
    render(<TestMenu />)

    screen.getByRole("menuitem", { name: "Second" }).focus()
    await user.keyboard("{End}")
    expect(screen.getByRole("menuitem", { name: "Third" })).toHaveFocus()

    await user.keyboard("{Home}")
    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus()
  })

  it("reaches a submenu trigger that is not a direct child", async () => {
    const user = userEvent.setup()
    render(<NestedMenu />)

    screen.getByRole("menuitem", { name: "Log out" }).focus()
    await user.keyboard("{ArrowDown}")

    expect(screen.getByRole("menuitem", { name: "Theme" })).toHaveFocus()
  })

  it("keeps submenu items out of the parent menu's order", async () => {
    const user = userEvent.setup()
    render(<NestedMenu />)

    // Tab rather than .focus(): the submenu opens from React state, which only
    // settles inside user-event's act() wrapper.
    await user.tab()
    expect(screen.getByRole("menuitem", { name: "Theme" })).toHaveFocus()
    expect(screen.getByRole("menuitem", { name: "Light" })).toBeInTheDocument()

    await user.keyboard("{ArrowDown}")

    expect(screen.getByRole("menuitem", { name: "Log out" })).toHaveFocus()
  })

  // Arrows pressed inside a submenu used to bubble to the parent menu, which
  // could not find the focused item and threw focus back to its own first one.
  it("navigates within an open submenu", async () => {
    const user = userEvent.setup()
    render(<NestedMenu />)

    await user.tab()
    expect(screen.getByRole("menuitem", { name: "Theme" })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole("menuitem", { name: "Light" })).toHaveFocus()

    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Dark" })).toHaveFocus()

    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("menuitem", { name: "Light" })).toHaveFocus()
  })
})
