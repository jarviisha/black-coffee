import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useOptimisticFollow } from "./useOptimisticFollow"
import { useFollowStore } from "@/store/followStore"

const mutate = vi.fn()

vi.mock("@/api/hooks/useFollowUser", () => ({
  useFollowUser: () => ({ mutate, isPending: false }),
}))

// The real auth store is `persist`-wrapped; a stub keeps this a unit test.
vi.mock("@/store/authStore", () => ({
  useAuthStore: (selector: (s: { user: { id: string } }) => unknown) =>
    selector({ user: { id: "viewer-1" } }),
}))

const AUTHOR_ID = "author-1"
const VIEWER_ID = "viewer-1"

describe("useOptimisticFollow", () => {
  beforeEach(() => {
    mutate.mockReset()
    useFollowStore.setState({ overrides: {} })
  })

  it("shows the follow button when the payload says the viewer does not follow", () => {
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: AUTHOR_ID, initialFollowing: false }),
    )
    expect(result.current.showFollow).toBe(true)
  })

  it("hides the follow button when the payload says the viewer already follows", () => {
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: AUTHOR_ID, initialFollowing: true }),
    )
    expect(result.current.showFollow).toBe(false)
  })

  it("hides the button when the author was followed elsewhere, e.g. the profile header", () => {
    // The post payload was fetched before the follow happened, so its flag is
    // stale — the store override has to win. This is the reported bug.
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: AUTHOR_ID, initialFollowing: false }),
    )
    expect(result.current.showFollow).toBe(true)

    act(() => useFollowStore.getState().setFollowing(AUTHOR_ID, true))

    expect(result.current.showFollow).toBe(false)
  })

  it("shows the button again when the author was unfollowed elsewhere", () => {
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: AUTHOR_ID, initialFollowing: true }),
    )
    expect(result.current.showFollow).toBe(false)

    act(() => useFollowStore.getState().setFollowing(AUTHOR_ID, false))

    expect(result.current.showFollow).toBe(true)
  })

  it("does not leak follow state between authors", () => {
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: "author-2", initialFollowing: false }),
    )
    act(() => useFollowStore.getState().setFollowing(AUTHOR_ID, true))
    expect(result.current.showFollow).toBe(true)
  })

  it("never offers to follow the viewer's own posts", () => {
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: VIEWER_ID, initialFollowing: false }),
    )
    expect(result.current.showFollow).toBe(false)
  })

  it("marks the author followed immediately and reverts if the request fails", () => {
    const { result } = renderHook(() =>
      useOptimisticFollow({ authorId: AUTHOR_ID, initialFollowing: false }),
    )

    act(() => result.current.handleFollow())

    expect(mutate).toHaveBeenCalledWith({ userKey: AUTHOR_ID }, expect.anything())
    expect(result.current.showFollow).toBe(false)

    const { onError } = mutate.mock.calls[0][1] as { onError: () => void }
    act(() => onError())

    expect(result.current.showFollow).toBe(true)
  })
})
