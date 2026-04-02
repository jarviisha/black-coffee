import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetFeed } from "@/api/hooks/useGetFeed"
import { PostCard } from "@/shared/post/PostCard"
import { Spinner } from "@/components/ui/Spinner"
import { useAuthStore } from "@/store/authStore"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import type { HandlerFeedItemResponse } from "@/api/models/handler/FeedItemResponse"

export function FeedList() {
  const { t } = useTranslation()
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const { data, isLoading, isFetching, isError } = useGetFeed(
    cursor ? { cursor } : undefined,
    { query: { enabled: isInitialized } },
  )

  const { items, sentinelRef } = useCursorPagination<HandlerFeedItemResponse>({
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
      <div className="py-16 text-center text-sm text-text-muted">
        {t("feed.error")}
      </div>
    )
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-text-muted">
        {t("feed.empty")}
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
