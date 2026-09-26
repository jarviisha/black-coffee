import { render, screen } from "@testing-library/react"
import { act } from "react"
import { beforeEach, describe, expect, it } from "vitest"
import { useState } from "react"
import { useRewindOnPost } from "./useRewindOnPost"
import { useComposeStore } from "@/store/composeStore"

function CursorHarness() {
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  useRewindOnPost(setCursor)

  return (
    <div>
      <span data-testid="cursor">{cursor ?? "page-1"}</span>
      <button onClick={() => setCursor("page-2")}>scroll</button>
    </div>
  )
}

describe("useRewindOnPost", () => {
  beforeEach(() => {
    useComposeStore.setState({ postedAt: undefined })
  })

  it("rewinds a scrolled list to page one when a post is created", () => {
    render(<CursorHarness />)
    act(() => {
      screen.getByRole("button", { name: "scroll" }).click()
    })
    expect(screen.getByTestId("cursor")).toHaveTextContent("page-2")

    act(() => {
      useComposeStore.getState().markPosted()
    })

    expect(screen.getByTestId("cursor")).toHaveTextContent("page-1")
  })

  it("leaves the cursor alone while no post is created", () => {
    render(<CursorHarness />)
    act(() => {
      screen.getByRole("button", { name: "scroll" }).click()
    })
    act(() => {
      useComposeStore.getState().open()
    })

    expect(screen.getByTestId("cursor")).toHaveTextContent("page-2")
  })
})
