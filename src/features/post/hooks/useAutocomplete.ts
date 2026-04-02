import { useState, useCallback, useMemo, useRef } from "react"
import type { RefObject } from "react"
import type { UseFormSetValue } from "react-hook-form"
import { useSearch } from "@/api/hooks/useSearch"
import { useSearchHashtags } from "@/api/hooks/useSearchHashtags"
import type { CreatePostInput } from "../schemas"

// Typography props to mirror from textarea to measurement div
const MIRROR_STYLE_PROPS = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "boxSizing",
] as const

export interface TriggerDetection {
  type: "mention" | "hashtag"
  query: string
  triggerStart: number
}

export interface SuggestionState extends TriggerDetection {
  activeIndex: number
  dropdownPos: { top: number; left: number }
}

export interface SuggestionItem {
  label: string
  sub?: string
  avatarUrl?: string
  id?: string
}

export function useAutocomplete(
  content: string,
  setValue: UseFormSetValue<CreatePostInput>,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  modalBodyRef: RefObject<HTMLDivElement | null>,
  autoResize: () => void,
) {
  const [suggestion, setSuggestion] = useState<SuggestionState | null>(null)
  // Tracks username → user ID for all mentions inserted via autocomplete
  const mentionedUserIds = useRef<Record<string, string>>({})

  const mentionEnabled = suggestion?.type === "mention" && suggestion.query.length >= 1
  const hashtagEnabled = suggestion?.type === "hashtag" && suggestion.query.length >= 2

  const { data: mentionData } = useSearch(
    { q: suggestion?.type === "mention" ? suggestion.query : "__", type: "users", limit: 6 },
    { query: { enabled: mentionEnabled } },
  )
  const { data: hashtagData } = useSearchHashtags(
    { q: suggestion?.type === "hashtag" && suggestion.query.length >= 2 ? suggestion.query : "__" },
    { query: { enabled: hashtagEnabled } },
  )

  const suggestions = useMemo<SuggestionItem[]>(() => {
    if (!suggestion) return []
    if (suggestion.type === "mention") {
      return (mentionData?.users ?? []).map((u) => ({
        label: u.username ?? "",
        sub: u.display_name ?? undefined,
        avatarUrl: u.avatar_url ?? undefined,
        id: u.id,
      }))
    }
    return (hashtagData?.results ?? []).map((tag) => ({ label: tag }))
  }, [suggestion, mentionData, hashtagData])

  // Detect @mention or #hashtag trigger immediately before cursor
  const detectTrigger = useCallback((text: string, cursor: number): TriggerDetection | null => {
    const before = text.slice(0, cursor)
    const match = before.match(/(?:^|[\s\n])([@#])(\w*)$/)
    if (!match) return null
    const trigger = match[1] as "@" | "#"
    const query = match[2]
    const triggerStart = cursor - query.length - 1
    return { type: trigger === "@" ? "mention" : "hashtag", query, triggerStart }
  }, [])

  // Measure pixel position of a character index within the textarea.
  // Clones textarea styles into a hidden fixed div, inserts a zero-width marker
  // at `position`, then reads its bounding rect relative to the modal body.
  const getCaretCoords = useCallback(
    (position: number, dropdownWidth = 224): { top: number; left: number } => {
      const textarea = textareaRef.current
      const modal = modalBodyRef.current
      if (!textarea || !modal) return { top: 0, left: 0 }

      const computed = window.getComputedStyle(textarea)
      const textareaRect = textarea.getBoundingClientRect()
      const mirror = document.createElement("div")

      mirror.style.position = "fixed"
      mirror.style.top = `${textareaRect.top}px`
      mirror.style.left = `${textareaRect.left}px`
      mirror.style.width = `${textareaRect.width}px`
      mirror.style.height = `${textareaRect.height}px`
      mirror.style.overflow = "hidden"
      mirror.style.visibility = "hidden"
      mirror.style.pointerEvents = "none"
      mirror.style.whiteSpace = "pre-wrap"
      mirror.style.wordBreak = "break-word"
      mirror.style.overflowWrap = "break-word"

      for (const prop of MIRROR_STYLE_PROPS) {
        ;(mirror.style as unknown as Record<string, string>)[prop] = computed[prop]
      }

      mirror.textContent = textarea.value.slice(0, position)
      const marker = document.createElement("span")
      marker.textContent = "\u200b"
      mirror.appendChild(marker)

      document.body.appendChild(mirror)
      const markerRect = marker.getBoundingClientRect()
      const modalRect = modal.getBoundingClientRect()
      document.body.removeChild(mirror)

      return {
        top: markerRect.bottom - modalRect.top,
        // Clamp so dropdown doesn't overflow the modal's right edge
        left: Math.min(markerRect.left - modalRect.left, modalRect.width - dropdownWidth),
      }
    },
    [textareaRef, modalBodyRef],
  )

  // Insert selected suggestion into textarea content
  const insertSuggestion = useCallback(
    (item: SuggestionItem) => {
      if (!suggestion) return
      const prefix = suggestion.type === "mention" ? "@" : "#"
      const el = textareaRef.current
      const cursor = el?.selectionStart ?? suggestion.triggerStart + suggestion.query.length + 1
      const text = content ?? ""
      const before = text.slice(0, suggestion.triggerStart)
      const after = text.slice(cursor)
      const newText = before + prefix + item.label + " " + after
      setValue("content", newText, { shouldValidate: false })
      setSuggestion(null)
      // Record username → id so the modal can build mention_user_ids on submit
      if (suggestion.type === "mention" && item.id) {
        mentionedUserIds.current[item.label] = item.id
      }
      const newPos = before.length + prefix.length + item.label.length + 1
      setTimeout(() => {
        el?.focus()
        el?.setSelectionRange(newPos, newPos)
        autoResize()
      }, 0)
    },
    [suggestion, content, setValue, autoResize, textareaRef],
  )

  return {
    suggestion,
    setSuggestion,
    suggestions,
    detectTrigger,
    getCaretCoords,
    insertSuggestion,
    mentionedUserIds,
  }
}
