import { useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useQueryClient } from "@tanstack/react-query"
import { useCreateComment } from "@/api/hooks/useCreateComment"
import { getCommentsQueryKey } from "@/api/hooks/useGetComments"
import { getRepliesQueryKey } from "@/api/hooks/useGetReplies"
import { Button } from "@/components/ui/Button"

interface CommentInputProps {
  postId: string
  parentId?: string
  onSuccess?: () => void
}

export function CommentInput({ postId, parentId, onSuccess }: CommentInputProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { mutate: createComment, isPending } = useCreateComment()

  const handleSubmit = () => {
    if (!draft.trim()) return
    createComment(
      { postID: postId, data: { content: draft.trim(), parent_id: parentId } },
      {
        onSuccess: () => {
          setDraft("")
          if (textareaRef.current) {
            // FIX 1: Trả về chiều cao mặc định an toàn hơn
            textareaRef.current.style.height = "auto"
          }
          void queryClient.invalidateQueries({ queryKey: getCommentsQueryKey(postId) })
          if (parentId) {
            void queryClient.invalidateQueries({ queryKey: getRepliesQueryKey(postId, parentId) })
          }
          onSuccess?.()
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
    if (e.key === "Escape" && parentId) {
      onSuccess?.()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value)
    const el = e.target

    // FIX 2: Ép chiều cao về '0px' trước khi đọc scrollHeight
    // Dùng 'auto' trên Firefox đôi khi vẫn giữ lại phần dư của line-height cũ
    el.style.height = "0px"
    el.style.height = `${el.scrollHeight}px`
  }

  const placeholder = parentId ? t("comment.replyPlaceholder") : t("comment.placeholder")

  return (
    <div className="bg-surface-hi flex items-start gap-3 rounded px-4 py-2">
      <div className="mt-2 min-w-0 flex-1">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={!!parentId}
          // FIX 3: Thêm các class Tailwind sau:
          // - `block`: Chuyển từ inline-block thành block để xóa khoảng trống descender ở đáy (thường là 4-5px).
          // - `overflow-hidden`: Ngăn Firefox dự trù không gian cho thanh cuộn dọc (dẫn đến sai lệch scrollHeight).
          // - `m-0`: Triệt tiêu hoàn toàn margin mặc định của Firefox.
          // - `leading-[1.5]`: Khai báo line-height tường minh thay vì để trình duyệt tự đoán.
          className="text-text placeholder-text-sub m-0 block w-full resize-none appearance-none overflow-hidden bg-transparent p-0 text-sm outline-none"
          // FIX 4: Đảm bảo textarea render ra luôn tính toán đúng (đặc biệt khi có placeholder dài)
          rows={1}
        />
        {draft.trim() && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-text-sub text-xs">{t("comment.hint")}</span>
            <Button size="sm" onClick={handleSubmit} isLoading={isPending}>
              {t("comment.reply")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
