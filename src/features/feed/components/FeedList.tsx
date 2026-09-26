import { useState } from "react"
import { Link } from "react-router"
import { useTranslation } from "react-i18next"
import { useGetFeed } from "@/api/hooks/useGetFeed"
import { PostCard } from "@/shared/post/PostCard"
import { Spinner } from "@/components/ui/Spinner"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/authStore"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import { useRewindOnPost } from "@/hooks/useRewindOnPost"
import type { HandlerFeedItemResponse } from "@/api/models/handler/FeedItemResponse"

export function FeedList() {
  const { t } = useTranslation()
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const [cursor, setCursor] = useState<string | undefined>(undefined)
  useRewindOnPost(setCursor)

  const { data, isLoading, isFetching, isError, refetch } = useGetFeed(
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
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-text-muted text-sm">{t("feed.error")}</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          {t("common.retry")}
        </Button>
      </div>
    )
  }

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <p className="text-text-muted text-sm">{t("feed.empty")}</p>
        <Link
          to="/discover"
          className="text-text text-sm font-medium underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
        >
          {t("nav.discover")}
        </Link>
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
