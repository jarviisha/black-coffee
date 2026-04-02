import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useGetUserPosts } from "@/api/hooks/useGetUserPosts"
import { PostCard } from "@/shared/post/PostCard"
import { Spinner } from "@/components/ui/Spinner"
import { useCursorPagination } from "@/hooks/useCursorPagination"
import type { DtoPostResponse } from "@/api/models/dto/PostResponse"

type Post = DtoPostResponse

interface UserPostsListProps {
  userID: string
}

export function UserPostsList({ userID }: UserPostsListProps) {
  const { t } = useTranslation()
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const { data, isLoading, isFetching, isError } = useGetUserPosts(
    userID,
    cursor ? { cursor } : undefined,
    { query: { enabled: !!userID } },
  )

  const { items, sentinelRef } = useCursorPagination<Post>({
    cursor,
    onNextPage: setCursor,
    isFetching,
    page: data,
  })

  if (isLoading && items.length === 0) {
    return <Spinner centered className="py-16" />
  }

  if (isError && items.length === 0) {
    return <div className="text-text-muted py-16 text-center text-sm">{t("profile.loadError")}</div>
  }

  if (!isLoading && items.length === 0) {
    return <div className="text-text-muted py-16 text-center text-sm">{t("profile.noPosts")}</div>
  }

  return (
    <div>
      {items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Sentinel for infinite scroll */}
      <div ref={sentinelRef} />

      {isFetching && <Spinner centered className="py-6" />}
    </div>
  )
}
