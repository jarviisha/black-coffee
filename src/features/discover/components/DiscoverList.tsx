import { useState } from "react"
import { useGetDiscover } from "@/api/hooks/useGetDiscover"
import { PostCard } from "@/shared/post/PostCard"
import { Spinner } from "@/components/ui/Spinner"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import type { HandlerPostResponse } from "@/api/models/handler/PostResponse"

export function DiscoverList() {
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const { data, isLoading, isFetching, isError } = useGetDiscover({
    limit: 20,
    cursor,
  })

  const { items, sentinelRef } = useCursorPagination<HandlerPostResponse>({
    cursor,
    onNextPage: setCursor,
    isFetching,
    page: data,
  })

  if (isLoading && items.length === 0) {
    return <Spinner centered className="py-16" />
  }

  if (isError && items.length === 0) {
    return (
      <div className="text-text-muted py-16 text-center text-sm">
        Không thể tải bài viết. Thử lại sau.
      </div>
    )
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="text-text-muted py-16 text-center text-sm">
        Chưa có bài viết nào để khám phá.
      </div>
    )
  }

  return (
    <div>
      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Sentinel — triggers next page load when scrolled into view */}
      <div ref={sentinelRef} />

      {isFetching && <Spinner centered className="py-6" />}
    </div>
  )
}
