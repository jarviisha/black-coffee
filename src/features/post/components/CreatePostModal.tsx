import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { cn, getApiErrorMessage } from "@/lib/utils"
import { Button, ButtonIcon } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { useAuthStore } from "@/store/authStore"
import { Avatar } from "@/components/ui/Avatar"
import { useCreatePost } from "@/api/hooks/useCreatePost"
import { createPostSchema, type CreatePostInput } from "../schemas"
import { useMediaUpload, ACCEPTED_MEDIA_TYPES } from "../hooks/useMediaUpload"
import { useAutocomplete } from "../hooks/useAutocomplete"
import { useEmojiPicker } from "../hooks/useEmojiPicker"
import { PostTextarea } from "./PostTextarea"
import { MediaPreviewGrid } from "./MediaPreviewGrid"
import { VisibilitySelector } from "./VisibilitySelector"
import { AutocompleteDropdown } from "./AutocompleteDropdown"
import { UserInfo } from "@/components/ui/UserInfo"
import ReactEmojiPicker, { type EmojiClickData, Theme } from "emoji-picker-react"
import { useThemeStore } from "@/store/themeStore"

const MAX_CHARS = 515

interface CreatePostModalProps {
  onClose: () => void
}

export default function CreatePostModal({ onClose }: CreatePostModalProps) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const modalBodyRef = useRef<HTMLDivElement>(null)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const theme = useThemeStore((s) => s.theme)

  const schema = useMemo(() => createPostSchema(t, MAX_CHARS), [t])
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      content: "",
      media_keys: [],
      mention_user_ids: [],
      tags: [],
      visibility: "public",
    },
  })

  const content = useWatch({ control, name: "content", defaultValue: "" })
  const visibility = useWatch({ control, name: "visibility", defaultValue: "public" })
  const charCount = content?.length ?? 0

  const autoResize = useCallback(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }, [])

  const { fileInputRef, uploadedMedia, uploadError, isUploading, handleFileSelect, removeMedia } =
    useMediaUpload(setValue, t)

  const {
    suggestion,
    setSuggestion,
    suggestions,
    detectTrigger,
    getCaretCoords,
    insertSuggestion,
    mentionedUserIds,
  } = useAutocomplete(content ?? "", setValue, textareaRef, modalBodyRef, autoResize)

  const { mutate: createPost, isPending: isCreating } = useCreatePost()

  const { emojiPickerPos, setEmojiPickerPos, insertEmoji, toggleEmojiPicker } = useEmojiPicker({
    content: content ?? "",
    textareaRef,
    getCaretCoords,
    setContent: (value) => setValue("content", value, { shouldValidate: false }),
    autoResize,
  })

  // Lock body scroll + compensate scrollbar width to prevent layout shift
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPaddingRight = document.body.style.paddingRight
    document.body.style.overflow = "hidden"
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }
    textareaRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPaddingRight
    }
  }, [])

  // Focus trap: keep Tab cycling inside the modal
  useEffect(() => {
    const modal = modalBodyRef.current
    if (!modal) return
    const FOCUSABLE =
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.defaultPrevented) return
      const focusable = [...modal.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    modal.addEventListener("keydown", onTab)
    return () => modal.removeEventListener("keydown", onTab)
  }, [])

  // Escape to close (only when no suggestion dropdown is open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !suggestion) onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, suggestion])

  const onSubmit = (data: CreatePostInput) => {
    setSubmitError(null)
    const mentionUsernames = [...data.content.matchAll(/(?:^|\s)@(\w+)/gm)].map((m) => m[1])
    const mention_user_ids = [...new Set(mentionUsernames)]
      .map((u) => mentionedUserIds.current[u])
      .filter(Boolean)
    const tags = [...new Set([...data.content.matchAll(/(?:^|\s)#(\w+)/gm)].map((m) => m[1]))]
    createPost(
      {
        data: {
          content: data.content,
          media_keys: data.media_keys,
          mention_user_ids,
          tags,
          visibility: data.visibility,
        },
      },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: [{ url: "/posts" }] })
          void queryClient.invalidateQueries({
            queryKey: [{ url: "/users/:userID/posts", params: { userID: user?.id } }],
          })
          onClose()
        },
        onError: (err) => setSubmitError(getApiErrorMessage(err) ?? t("compose.error")),
      },
    )
  }

  // Textarea keyboard handler: suggestion navigation + Ctrl/Cmd+Enter submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (suggestion && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSuggestion((s) =>
          s ? { ...s, activeIndex: Math.min(s.activeIndex + 1, suggestions.length - 1) } : s,
        )
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSuggestion((s) => (s ? { ...s, activeIndex: Math.max(s.activeIndex - 1, 0) } : s))
        return
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault()
        insertSuggestion(suggestions[suggestion.activeIndex])
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        setSuggestion(null)
        return
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      void handleSubmit(onSubmit)()
    }
  }

  const { ref: formRef, ...contentRegister } = register("content")

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (emojiPickerPos) setEmojiPickerPos(null)
    setValue("content", e.target.value, { shouldValidate: true })
    const cursor = e.target.selectionStart ?? e.target.value.length
    const trigger = detectTrigger(e.target.value, cursor)

    if (trigger) {
      setSuggestion((prev) => {
        const isNewTrigger = prev?.triggerStart !== trigger.triggerStart
        return {
          ...trigger,
          activeIndex: isNewTrigger ? 0 : (prev?.activeIndex ?? 0),
          // Recompute position only when trigger character moves (new @ or #)
          dropdownPos: isNewTrigger
            ? getCaretCoords(trigger.triggerStart + 1)
            : (prev?.dropdownPos ?? { top: 0, left: 0 }),
        }
      })
    } else {
      setSuggestion(null)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("compose.title")}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="bg-overlay/20 absolute inset-0 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalBodyRef}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface relative z-10 flex w-full max-w-xl flex-col rounded-lg shadow-lg"
      >
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-2">
          <h2 className="text-text text-base font-semibold">{t("compose.title")}</h2>
          <Button
            variant="ghost"
            color="muted"
            size="sm"
            onClick={onClose}
            aria-label={t("post.media.close")}
          >
            <Icon name="x" size={18} aria-hidden="true" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col">
          <div className="px-4 pt-4">
            <div className="mb-3 flex items-center gap-3">
              <Avatar
                src={user?.avatar_url}
                name={user?.display_name}
                href={`/@${user?.username}`}
              />
              <UserInfo displayName={user?.display_name} username={user?.username} />
            </div>
            <PostTextarea
              formRef={formRef}
              textareaRef={textareaRef}
              registerProps={contentRegister}
              content={content ?? ""}
              error={errors.content?.message}
              suggestion={suggestion}
              suggestionsLength={suggestions.length}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onInput={autoResize}
              placeholder={t("compose.placeholder")}
            />
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_MEDIA_TYPES}
                multiple
                onChange={(e) => void handleFileSelect(e)}
                className="hidden"
              />
              <ButtonIcon
                name={isUploading ? "loader-2" : "image"}
                iconSize={20}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                aria-label={t("compose.addMedia")}
                className={isUploading ? "animate-spin motion-reduce:animate-none" : undefined}
              />
              <ButtonIcon
                name="smile"
                iconSize={20}
                onClick={toggleEmojiPicker}
                aria-label={t("compose.addEmoji")}
                aria-expanded={!!emojiPickerPos}
                color={emojiPickerPos ? "accent" : "muted"}
              />
            </div>
          </div>

          <MediaPreviewGrid media={uploadedMedia} onRemove={removeMedia} />

          {uploadError && <p className="text-error px-4 pt-2 text-xs">{uploadError}</p>}
          {submitError && <p className="text-error px-4 pt-2 text-xs">{submitError}</p>}

          {/* Footer */}
          <div className="border-border mt-3 flex items-center justify-between border-t px-4 py-3">
            <div className="flex items-center gap-1">
              <VisibilitySelector value={visibility} onChange={(v) => setValue("visibility", v)} />

              {isUploading && (
                <span className="text-text-muted text-xs">{t("compose.uploadingMedia")}</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span
                className={cn("text-xs", charCount > MAX_CHARS ? "text-error" : "text-text-sub")}
              >
                {charCount}/{MAX_CHARS}
              </span>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                color="accent"
                className="w-20"
                isLoading={isCreating}
                disabled={isUploading || charCount === 0 || charCount > MAX_CHARS}
              >
                {t("compose.submit")}
              </Button>
            </div>
          </div>
        </form>

        {/* Autocomplete dropdown — absolutely positioned at caret location */}
        {suggestion && (
          <AutocompleteDropdown
            suggestion={suggestion}
            suggestions={suggestions}
            onSelect={insertSuggestion}
          />
        )}

        {/* Emoji picker — absolutely positioned at caret location, stays open */}
        {emojiPickerPos && (
          <div
            className="absolute z-20"
            style={{ top: emojiPickerPos.top, left: emojiPickerPos.left }}
          >
            <ReactEmojiPicker
              onEmojiClick={(data: EmojiClickData) => insertEmoji(data.emoji)}
              theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
              lazyLoadEmojis
              skinTonesDisabled
              width={360}
              height={320}
            />
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
