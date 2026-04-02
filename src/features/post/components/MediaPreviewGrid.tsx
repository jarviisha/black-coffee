import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import type { UploadedMedia } from "../hooks/useMediaUpload"

interface MediaPreviewGridProps {
  media: UploadedMedia[]
  onRemove: (key: string) => void
}

export function MediaPreviewGrid({ media, onRemove }: MediaPreviewGridProps) {
  const { t } = useTranslation()

  if (media.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-4 pt-3">
      {media.map((m) => (
        <div key={m.key} className="group relative h-20 w-20 overflow-hidden rounded-md">
          {m.media_type.startsWith("video") ? (
            <video src={m.url} className="h-full w-full object-cover" muted />
          ) : (
            <img src={m.url} alt="" className="h-full w-full object-cover" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(m.key)}
            className="bg-overlay/70 text-overlay-fg hover:bg-overlay/90 focus-visible:ring-overlay-fg absolute top-1 right-1 h-5 w-5 rounded-full"
            aria-label={t("compose.removeMedia")}
          >
            <Icon name="x" size={12} aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  )
}
