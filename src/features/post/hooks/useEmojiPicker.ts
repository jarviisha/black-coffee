import { useState, useCallback } from "react"
import type { RefObject } from "react"

interface UseEmojiPickerOptions {
  content: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  getCaretCoords: (position: number, offsetX?: number) => { top: number; left: number }
  setContent: (value: string) => void
  autoResize: () => void
}

export function useEmojiPicker({
  content,
  textareaRef,
  getCaretCoords,
  setContent,
  autoResize,
}: UseEmojiPickerOptions) {
  const [emojiPickerPos, setEmojiPickerPos] = useState<{ top: number; left: number } | null>(null)

  const insertEmoji = useCallback(
    (emoji: string) => {
      const el = textareaRef.current
      const start = el?.selectionStart ?? content.length
      const end = el?.selectionEnd ?? start
      const newText = content.slice(0, start) + emoji + content.slice(end)
      setContent(newText)
      const newPos = start + emoji.length
      setTimeout(() => {
        el?.focus()
        el?.setSelectionRange(newPos, newPos)
        autoResize()
      }, 0)
    },
    [content, setContent, textareaRef, autoResize],
  )

  const toggleEmojiPicker = useCallback(() => {
    if (emojiPickerPos) {
      setEmojiPickerPos(null)
      return
    }
    const cursor = textareaRef.current?.selectionStart ?? content.length
    setEmojiPickerPos(getCaretCoords(cursor, 360))
  }, [emojiPickerPos, textareaRef, content, getCaretCoords])

  return { emojiPickerPos, setEmojiPickerPos, insertEmoji, toggleEmojiPicker }
}
