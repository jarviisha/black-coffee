import { useState } from "react"
import { useComposeStore } from "@/store/composeStore"

/**
 * Rewinds a cursor-paginated list to its first page after the user posts.
 *
 * Invalidating the query is not enough on its own: once the sentinel has
 * advanced the cursor, the active query is a later page, and the new post
 * lives on page one. Adjusting state during render rather than in an effect is
 * the documented pattern for "reset state when a prop changes".
 *
 * Call it before the query hook, so the rewound cursor is the one used.
 */
export function useRewindOnPost(setCursor: (cursor: undefined) => void) {
  const postedAt = useComposeStore((s) => s.postedAt)
  const [seenPostedAt, setSeenPostedAt] = useState(postedAt)

  if (postedAt !== seenPostedAt) {
    setSeenPostedAt(postedAt)
    setCursor(undefined)
  }
}
