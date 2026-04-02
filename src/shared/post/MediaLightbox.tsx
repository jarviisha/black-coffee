import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"
import Icon from "@/components/ui/Icon"
import type { HandlerMediaResponse } from "@/api/models/handler/MediaResponse"

interface MediaLightboxProps {
  media: HandlerMediaResponse[]
  initialIndex: number
  onClose: () => void
}

export default function MediaLightbox({ media, initialIndex, onClose }: MediaLightboxProps) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(initialIndex)

  const total = media.length
  const current = media[index]
  const isVideo = current.media_type?.startsWith("video")

  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total])
  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose, prev, next])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("post.media.viewer")}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      onClick={onClose}
    >
      {/* Fixed background */}
      <div className="absolute inset-0 bg-overlay/85 backdrop-blur-sm" />

      {/* Main media */}
      <div
        className="relative flex min-h-0 flex-1 items-center justify-center p-6 pb-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
          <video
            key={current.id}
            src={current.url}
            controls
            autoPlay
            className="shadow-overlay max-h-full max-w-full bg-overlay-media"
          />
        ) : (
          <img
            key={current.id}
            src={current.url}
            alt=""
            className="shadow-overlay max-h-full max-w-full object-contain"
          />
        )}

        {/* Close */}
        <button
          onClick={onClose}
          aria-label={t("post.media.close")}
          className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-overlay-fg/10 text-overlay-fg transition-colors hover:bg-overlay-fg/25 focus-visible:ring-2 focus-visible:ring-overlay-fg"
        >
          <Icon name="x" size={18} />
        </button>

        {/* Prev / Next */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label={t("post.media.previous")}
              className="absolute top-1/2 left-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-overlay-fg/10 text-overlay-fg transition-colors hover:bg-overlay-fg/25 focus-visible:ring-2 focus-visible:ring-overlay-fg"
            >
              <Icon name="chevron-left" size={20} />
            </button>
            <button
              onClick={next}
              aria-label={t("post.media.next")}
              className="absolute top-1/2 right-4 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-overlay-fg/10 text-overlay-fg transition-colors hover:bg-overlay-fg/25 focus-visible:ring-2 focus-visible:ring-overlay-fg"
            >
              <Icon name="chevron-right" size={20} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div
          className="relative z-10 flex justify-center gap-2 px-6 pt-2 pb-6"
          onClick={(e) => e.stopPropagation()}
        >
          {media.map((m, i) => (
            <button
              key={m.id ?? i}
              onClick={() => setIndex(i)}
              aria-label={t("post.media.thumbnail", { number: String(i + 1) })}
              className={`duration-fast relative h-14 w-14 shrink-0 overflow-hidden rounded transition-all focus-visible:ring-2 focus-visible:ring-overlay-fg motion-reduce:transition-none ${
                i === index
                  ? "opacity-100 ring-1 ring-overlay-fg ring-offset-1 ring-offset-transparent"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              {m.media_type?.startsWith("video") ? (
                <>
                  <div className="h-full w-full bg-overlay-thumb" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Icon name="play" size={16} className="text-overlay-fg" />
                  </span>
                </>
              ) : (
                <img
                  src={m.url}
                  alt={t("post.media.imageAlt", { number: String(i + 1) })}
                  className="h-full w-full object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body,
  )
}
