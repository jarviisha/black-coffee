import { useState, useRef, useEffect, useCallback } from "react"

type PageResult<T> = { data?: T[] | null; next_cursor?: string | null }

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
  /**
   * When this value changes, the accumulated list is cleared and the current
   * page is re-processed from scratch. Useful for live-update scenarios where
   * new items arrive at the top (e.g. SSE notifications).
   */
  resetKey?: unknown
}

export function useCursorPagination<T>({ cursor, onNextPage, isFetching, page, resetKey }: UseCursorPaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const fetchedKeys = useRef(new Set<string>())
  const nextCursorRef = useRef<string | undefined>(undefined)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const appendPage = useCallback(
    (incoming: T[], nextCursor?: string | null) => {
      const key = cursor ?? "__initial__"
      if (fetchedKeys.current.has(key)) return
      fetchedKeys.current.add(key)
      setItems((prev) => (key === "__initial__" ? incoming : [...prev, ...incoming]))
      nextCursorRef.current = nextCursor ?? undefined
    },
    [cursor],
  )

  // When resetKey changes, clear accumulated state so the current page is re-processed.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (resetKey === undefined) return
    fetchedKeys.current.clear()
    nextCursorRef.current = undefined
    setItems([])
  }, [resetKey])

  // Syncing accumulated items with incoming page data from React Query (external system).
  // setState inside effect is intentional: data arrives asynchronously from the server
  // and must be accumulated across multiple pages — this cannot be derived during render.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (page?.data) appendPage(page.data, page.next_cursor)
  }, [page, appendPage, resetKey])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursorRef.current && !isFetching) {
          onNextPage(nextCursorRef.current)
        }
      },
      { rootMargin: "200px" },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [isFetching, onNextPage])

  return { items, sentinelRef }
}
