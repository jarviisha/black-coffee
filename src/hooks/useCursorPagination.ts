import { useState, useRef, useEffect, useCallback } from "react"

type PageResult<T> = { data?: T[] | null; next_cursor?: string | null }

/** Consecutive pages with nothing new before the list is treated as exhausted. */
const DRY_PAGE_LIMIT = 2

type UseCursorPaginationOptions<T> = {
  cursor: string | undefined
  onNextPage: (nextCursor: string) => void
  isFetching: boolean
  /**
   * Pass the current query result here. The hook will append items and advance
   * the cursor internally, eliminating the need for a useEffect in the caller.
   *
   * Cursor state must still live in the calling component so it can be passed
   * to the query hook before this hook is called (no circular dependency).
   */
  page?: PageResult<T> | null
}

export function useCursorPagination<T extends { id?: string }>({
  cursor,
  onNextPage,
  isFetching,
  page,
}: UseCursorPaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const fetchedKeys = useRef(new Set<string>())
  const seenIds = useRef(new Set<string>())
  const dryPages = useRef(0)
  const nextCursorRef = useRef<string | undefined>(undefined)
  // Callback ref rather than an object ref: callers render the sentinel only
  // after the first page has been appended, so the observer effect must re-run
  // when the node actually mounts, not just when `isFetching` changes.
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)

  const appendPage = useCallback(
    (incoming: T[], nextCursor?: string | null) => {
      const key = cursor ?? "__initial__"
      const isInitial = key === "__initial__"

      // The first page is replaced rather than appended, so a refetch — after
      // posting, or after a retry — can update it. Later pages are appended
      // once per cursor, which is what the guard below protects.
      if (!isInitial && fetchedKeys.current.has(key)) return
      fetchedKeys.current.add(key)

      if (isInitial) seenIds.current.clear()

      // A server can hand back rows already served under a previous cursor —
      // rendering those again duplicates React keys and, because such a page
      // still carries a next_cursor, scrolls forever.
      const fresh = incoming.filter((item) => {
        if (item.id === undefined) return true
        if (seenIds.current.has(item.id)) return false
        seenIds.current.add(item.id)
        return true
      })

      if (isInitial) {
        dryPages.current = 0
      } else if (fresh.length === 0) {
        // One repeat is normal when new rows shift the window; a second in a
        // row means the cursor is not advancing, so stop rather than loop.
        dryPages.current += 1
        if (dryPages.current >= DRY_PAGE_LIMIT) {
          nextCursorRef.current = undefined
          return
        }
      } else {
        dryPages.current = 0
      }

      setItems((prev) => (isInitial ? fresh : [...prev, ...fresh]))
      nextCursorRef.current = nextCursor ?? undefined
    },
    [cursor],
  )

  // Syncing accumulated items with incoming page data from React Query (external system).
  // setState inside effect is intentional: data arrives asynchronously from the server
  // and must be accumulated across multiple pages — this cannot be derived during render.
  useEffect(() => {
    if (page?.data) appendPage(page.data, page.next_cursor)
  }, [page, appendPage])

  useEffect(() => {
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursorRef.current && !isFetching) {
          onNextPage(nextCursorRef.current)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinel, isFetching, onNextPage])

  return { items, sentinelRef: setSentinel }
}
