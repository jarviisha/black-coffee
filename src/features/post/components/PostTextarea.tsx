import type { MutableRefObject } from "react"
import { cn } from "@/lib/utils"
import type { SuggestionState } from "../hooks/useAutocomplete"

// Parse text and wrap @mention / #hashtag with highlight spans for the mirror layer
function renderHighlighted(text: string) {
  const parts = text.split(/([@#]\w+)/g)
  return parts.map((part, i) => {
    if (part.match(/^@\w+$/)) {
      return (
        <span key={i} className="bg-accent/10 text-accent rounded-sm">
          {part}
        </span>
      )
    }
    if (part.match(/^#\w+$/)) {
      return (
        <span key={i} className="bg-accent/8 text-accent/75 rounded-sm">
          {part}
        </span>
      )
    }
    return <span key={i}>{part}</span>
  })
}

interface PostTextareaProps {
  formRef: (el: HTMLTextAreaElement | null) => void
  textareaRef: MutableRefObject<HTMLTextAreaElement | null>
  registerProps: Record<string, unknown>
  content: string
  error?: string
  suggestion: SuggestionState | null
  suggestionsLength: number
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
  onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement>
  onInput: () => void
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>
  placeholder: string
}

export function PostTextarea({
  formRef,
  textareaRef,
  registerProps,
  content,
  error,
  suggestion,
  suggestionsLength,
  onChange,
  onKeyDown,
  onInput,
  onFocus,
  placeholder,
}: PostTextareaProps) {
  return (
    <div className="relative flex-1">
      {/* Mirror layer: renders @mention and #hashtag highlights behind the textarea */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden text-sm wrap-break-word whitespace-pre-wrap select-none"
      >
        {renderHighlighted(content)}
      </div>
      <textarea
        ref={(el) => {
          formRef(el)
          textareaRef.current = el
        }}
        {...registerProps}
        onChange={onChange}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        placeholder={placeholder}
        rows={3}
        aria-autocomplete="list"
        aria-expanded={suggestion !== null && suggestionsLength > 0}
        className={cn(
          "relative w-full resize-none bg-transparent text-sm outline-none",
          "max-h-[40vh] min-h-18",
          "placeholder:text-text-sub text-transparent [caret-color:var(--color-text)]",
        )}
      />
      {error && <p className="text-error mt-1 text-xs">{error}</p>}
    </div>
  )
}
