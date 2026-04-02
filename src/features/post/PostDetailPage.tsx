import { useParams } from "react-router"
import { useTranslation } from "react-i18next"
import { useGetPost } from "@/api/hooks/useGetPost"
import { PostCard } from "@/shared/post/PostCard"
import { CommentInput } from "./components/CommentInput"
import { CommentList } from "./components/CommentList"
import { Spinner } from "@/components/ui/Spinner"
import { PageHeader } from "@/components/ui/PageHeader"

export function PostDetailPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()

  const { data: post, isLoading } = useGetPost(id ?? "")

  if (isLoading) {
    return <Spinner centered className="mx-auto max-w-xl py-16" />
  }

  if (!post?.id) {
    return (
      <div className="text-text-muted mx-auto max-w-xl py-16 text-center text-sm">
        {t("post.notFound")}
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={t("common.post")} back />
      <div className="relative mx-auto max-w-xl">
        <div className="border-border space-y-4 pb-12">
          <PostCard post={{ ...post, id: post.id }} />
          <div className="px-4">
            <CommentInput postId={id!} />
          </div>
          <CommentList postId={id!} />
        </div>
      </div>
    </div>
  )
}
