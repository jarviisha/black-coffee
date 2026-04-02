import { useTranslation } from "react-i18next"
import { useGetComments } from "@/api/hooks/useGetComments"
import { CommentItem } from "./CommentItem"
import { Spinner } from "@/components/ui/Spinner"

interface CommentListProps {
  postId: string
}

export function CommentList({ postId }: CommentListProps) {
  const { t } = useTranslation()
  const { data, isLoading } = useGetComments(postId)
  const comments = data?.data ?? []

  if (isLoading) {
    return <Spinner centered className="py-10" />
  }

  if (comments.length === 0) {
    return (
      <div className="py-14 text-center text-sm text-text-muted">
        {t("comment.noReplies")}
      </div>
    )
  }

  return (
    <div>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  )
}
