import { render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCursorPagination } from "./useCursorPagination"

type Item = { id: string }
type Page = { data?: Item[] | null; next_cursor?: string | null }

/**
 * Minimal IntersectionObserver stub. Records every observed element and lets a
 * test fire the intersection callback for it on demand.
 */
class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = []
  observed: Element[] = []
  callback: IntersectionObserverCallback

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    MockIntersectionObserver.instances.push(this)
  }

  observe(element: Element) {
    this.observed.push(element)
  }

  disconnect() {
    this.observed = []
  }

  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  trigger(isIntersecting: boolean) {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as never)
  }
}

/** Mirrors the early-return shape used by FeedList / DiscoverList / UserPostsList. */
function ListHarness({
  page,
  isFetching,
  onNextPage,
}: {
  page?: Page
  isFetching: boolean
  onNextPage: (cursor: string) => void
}) {
  const { items, sentinelRef } = useCursorPagination<Item>({
    cursor: undefined,
    onNextPage,
    isFetching,
    page,
  })

  if (isFetching && items.length === 0) return <div>loading</div>
  if (items.length === 0) return <div>empty</div>

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.id}</div>
      ))}
      <div data-testid="sentinel" ref={sentinelRef} />
    </div>
  )
}

describe("useCursorPagination", () => {
  beforeEach(() => {
    MockIntersectionObserver.instances = []
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function activeObserver() {
    return MockIntersectionObserver.instances.find((o) => o.observed.length > 0)
  }

  it("observes the sentinel that mounts only after the first page is appended", () => {
    const onNextPage = vi.fn()
    const { rerender } = render(
      <ListHarness isFetching={true} page={undefined} onNextPage={onNextPage} />,
    )

    // No sentinel while the initial spinner is showing.
    expect(activeObserver()).toBeUndefined()

    // Page arrives: isFetching flips to false in the same commit, but `items` is
    // only populated by an effect one render later — the regression this covers.
    rerender(
      <ListHarness
        isFetching={false}
        page={{ data: [{ id: "p1" }], next_cursor: "c2" }}
        onNextPage={onNextPage}
      />,
    )

    expect(screen.getByTestId("sentinel")).toBeInTheDocument()
    const observer = activeObserver()
    expect(observer).toBeDefined()
    expect(observer!.observed[0]).toBe(screen.getByTestId("sentinel"))
  })

  it("requests the next page when the sentinel intersects", () => {
    const onNextPage = vi.fn()
    const { rerender } = render(
      <ListHarness isFetching={true} page={undefined} onNextPage={onNextPage} />,
    )
    rerender(
      <ListHarness
        isFetching={false}
        page={{ data: [{ id: "p1" }], next_cursor: "c2" }}
        onNextPage={onNextPage}
      />,
    )

    activeObserver()!.trigger(true)

    expect(onNextPage).toHaveBeenCalledWith("c2")
  })

  it("does not request a next page on the last page", () => {
    const onNextPage = vi.fn()
    const { rerender } = render(
      <ListHarness isFetching={true} page={undefined} onNextPage={onNextPage} />,
    )
    rerender(
      <ListHarness
        isFetching={false}
        page={{ data: [{ id: "p1" }], next_cursor: undefined }}
        onNextPage={onNextPage}
      />,
    )

    activeObserver()!.trigger(true)

    expect(onNextPage).not.toHaveBeenCalled()
  })

  it("does not request a next page while a fetch is in flight", () => {
    const onNextPage = vi.fn()
    const { rerender } = render(
      <ListHarness isFetching={true} page={undefined} onNextPage={onNextPage} />,
    )
    rerender(
      <ListHarness
        isFetching={false}
        page={{ data: [{ id: "p1" }], next_cursor: "c2" }}
        onNextPage={onNextPage}
      />,
    )
    rerender(
      <ListHarness
        isFetching={true}
        page={{ data: [{ id: "p1" }], next_cursor: "c2" }}
        onNextPage={onNextPage}
      />,
    )

    activeObserver()!.trigger(true)

    expect(onNextPage).not.toHaveBeenCalled()
  })
})
