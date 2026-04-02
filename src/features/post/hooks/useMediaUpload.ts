import { useState, useRef } from "react"
import type { TFunction } from "i18next"
import type { UseFormSetValue } from "react-hook-form"
import { useUploadMedia } from "@/api/hooks/useUploadMedia"
import type { CreatePostInput } from "../schemas"

export interface UploadedMedia {
  key: string
  url: string
  media_type: string
  file: File
}

export const ACCEPTED_MEDIA_TYPES = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"

export function useMediaUpload(setValue: UseFormSetValue<CreatePostInput>, t: TFunction) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadMedia()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploadError(null)

    for (const file of Array.from(files)) {
      try {
        const res = await uploadMedia({ data: { file } })
        if (res.key && res.url && res.media_type) {
          setUploadedMedia((prev) => {
            const next = [
              ...prev,
              { key: res.key!, url: res.url!, media_type: res.media_type!, file },
            ]
            setValue(
              "media_keys",
              next.map((m) => m.key),
            )
            return next
          })
        }
      } catch {
        setUploadError(t("compose.uploadError"))
      }
    }

    // Reset so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removeMedia = (key: string) => {
    setUploadedMedia((prev) => {
      const next = prev.filter((m) => m.key !== key)
      setValue(
        "media_keys",
        next.map((m) => m.key),
      )
      return next
    })
  }

  return { fileInputRef, uploadedMedia, uploadError, isUploading, handleFileSelect, removeMedia }
}
