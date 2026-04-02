import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import Icon from "@/components/ui/Icon"
import MediaLightbox from "./MediaLightbox"
import type { HandlerMediaResponse } from "@/api/models/handler/MediaResponse"

interface PostMediaProps {
  media: HandlerMediaResponse[]
}

export function PostMedia({ media }: PostMediaProps) {
  const { t } = useTranslation()
  const sorted = useMemo(
    () => (media ?? []).toSorted((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [media],
  )
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!sorted.length) return null

  const item = sorted[index]
  const total = sorted.length
  const isVideo = item.media_type?.startsWith("video")

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setIndex((i) => (i - 1 + total) % total)
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setIndex((i) => (i + 1) % total)
  }

  function goTo(e: React.MouseEvent, i: number) {
    e.stopPropagation()
    setIndex(i)
  }

  function openLightbox(e: React.MouseEvent) {
    e.stopPropagation()
    e.preventDefault()
    setLightboxOpen(true)
  }

  return (
    <>
      <div
        className="ring-border bg-overlay-media relative mb-3 h-72 overflow-hidden rounded ring-1"
        style={{ contain: "layout style paint", transform: "translateZ(0)" }}
      >
        {/* Ambient blur background — images only */}
        {!isVideo && (
          <img
            src={item.url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60"
            style={{ filter: "blur(20px)" }}
          />
        )}

        {/* Main media */}
        {isVideo ? (
          <div className="relative h-full w-full">
            <video
              key={item.id}
              src={item.url}
              controls
              muted
              autoPlay
              loop
              playsInline
              className="h-full w-full object-contain"
            />
            <button
              onClick={openLightbox}
              aria-label={t("post.media.viewFullscreen")}
              className="bg-overlay-control/50 text-overlay-fg hover:bg-overlay-control/70 focus-visible:ring-overlay-fg absolute top-2 right-2 flex items-center justify-center rounded-full p-1.5 transition-colors focus-visible:ring-2"
            >
              <Icon name="maximize-2" size={14} />
            </button>
          </div>
        ) : (
          <button
            key={item.id}
            onClick={openLightbox}
            aria-label={t("post.media.viewImage")}
            className="relative h-full w-full cursor-zoom-in"
          >
            <img src={item.url} alt="" loading="lazy" className="h-full w-full object-contain" />
          </button>
        )}

        {/* Prev / Next */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label={t("post.media.previous")}
              className="bg-overlay-control/50 text-overlay-fg hover:bg-overlay-control/70 focus-visible:ring-overlay-fg absolute top-1/2 left-3 flex -translate-y-1/2 items-center justify-center rounded-full p-1 transition-colors focus-visible:ring-2"
            >
              <Icon name="chevron-left" size={16} />
            </button>
            <button
              onClick={next}
              aria-label={t("post.media.next")}
              className="bg-overlay-control/50 text-overlay-fg hover:bg-overlay-control/70 focus-visible:ring-overlay-fg absolute top-1/2 right-3 flex -translate-y-1/2 items-center justify-center rounded-full p-1 transition-colors focus-visible:ring-2"
            >
              <Icon name="chevron-right" size={16} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {total > 1 && (
          <div className="bg-overlay-control/50 absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded px-2 py-1">
            {sorted.map((_, i) => (
              <button
                key={i}
                onClick={(e) => goTo(e, i)}
                aria-label={t("post.media.thumbnail", { number: String(i + 1) })}
                className={[
                  "h-1 rounded-full transition-[width,background-color] duration-200 motion-reduce:transition-none",
                  i === index ? "bg-overlay-fg w-3" : "bg-overlay-fg/50 hover:bg-overlay-fg/80 w-1",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <MediaLightbox media={sorted} initialIndex={index} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}
