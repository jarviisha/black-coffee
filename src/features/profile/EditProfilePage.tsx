import { useState, useRef } from "react"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import Icon from "@/components/ui/Icon"
import { useUpdateMyProfile } from "@/api/hooks/useUpdateMyProfile"
import { useUploadAvatar } from "@/api/hooks/useUploadAvatar"
import { useUploadCover } from "@/api/hooks/useUploadCover"
import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/components/ui/PageHeader"

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  // Text fields
  const [displayName, setDisplayName] = useState(user?.display_name ?? "")
  const [bio, setBio] = useState(user?.bio ?? "")
  const [location, setLocation] = useState(user?.location ?? "")
  const [website, setWebsite] = useState(user?.website ?? "")

  // Local previews while upload is in-flight
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { mutate: updateProfile, isPending: isProfilePending } = useUpdateMyProfile()
  const { mutate: uploadAvatar, isPending: isAvatarPending } = useUploadAvatar()
  const { mutate: uploadCover, isPending: isCoverPending } = useUploadCover()

  // --- Immediate uploads ---

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    uploadAvatar(
      { data: { file } },
      {
        onSuccess: (updated) => {
          setUser(updated)
          setAvatarPreview(null)
        },
      },
    )
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverPreview(URL.createObjectURL(file))
    uploadCover(
      { data: { file } },
      {
        onSuccess: (updated) => {
          setUser(updated)
          setCoverPreview(null)
        },
      },
    )
  }

  // --- Form submit (text fields only) ---

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault()
    updateProfile(
      {
        data: {
          display_name: displayName || undefined,
          bio: bio || undefined,
          location: location || undefined,
          website: website || undefined,
        },
      },
      {
        onSuccess: (updated) => {
          setUser(updated)
          void navigate(-1)
        },
      },
    )
  }

  const avatarSrc = avatarPreview ?? user?.avatar_url
  const coverSrc = coverPreview ?? user?.cover_url

  return (
    <div>
      <PageHeader title={t("profile.edit.title")} back />
      <div className="relative mx-auto max-w-xl">
        {/* ── Section 1: Photos (immediate upload) ── */}
        <div className="relative mt-4">
          {/* Cover */}
          <button
            type="button"
            aria-label={t("profile.edit.changeCover")}
            disabled={isCoverPending}
            onClick={() => coverInputRef.current?.click()}
            className="bg-surface-hi focus-visible:ring-accent relative h-44 w-full overflow-hidden rounded focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
          >
            {coverSrc ? (
              <img
                src={coverSrc}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="from-surface to-surface-hi h-full w-full bg-linear-to-br" />
            )}
            <span className="bg-overlay/30 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100 motion-reduce:transition-none">
              <span className="bg-overlay-control/70 text-overlay-fg flex items-center gap-1.5 rounded px-3 py-1.5 text-xs">
                {isCoverPending ? (
                  <span className="border-overlay-fg/40 border-t-overlay-fg h-3.5 w-3.5 animate-spin rounded-full border-2" />
                ) : (
                  <Icon name="image" size={14} aria-hidden="true" />
                )}
                {t("profile.edit.changeCover")}
              </span>
            </span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleCoverChange}
          />

          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <button
              type="button"
              aria-label={t("profile.edit.changeAvatar")}
              disabled={isAvatarPending}
              onClick={() => avatarInputRef.current?.click()}
              className="group ring-bg focus-visible:ring-accent relative h-24 w-24 overflow-hidden rounded-full ring-4 focus-visible:outline-none disabled:cursor-not-allowed"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="bg-surface-hi text-text-muted flex h-full w-full items-center justify-center text-2xl font-medium">
                  {user?.display_name?.[0]?.toUpperCase() ?? "?"}
                </span>
              )}
              <span className="bg-overlay/40 absolute inset-0 flex items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
                {isAvatarPending ? (
                  <span className="border-overlay-fg/40 border-t-overlay-fg h-5 w-5 animate-spin rounded-full border-2" />
                ) : (
                  <Icon name="image" size={18} className="text-overlay-fg" aria-hidden="true" />
                )}
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* ── Section 2: Profile info ── */}
        <div className="border-border mt-16">
          <div className="border-border border-b px-4">
            <h1 className="text-lg font-semibold">{t("profile.edit.personalInformation")}</h1>
          </div>
          <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-5">
            <Input
              id="edit-display-name"
              label={t("profile.edit.displayName")}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t("profile.edit.displayNamePlaceholder")}
            />

            <Textarea
              id="edit-bio"
              label={t("profile.edit.bio")}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("profile.edit.bioPlaceholder")}
              rows={4}
              className="resize-none"
            />

            <Input
              id="edit-location"
              label={t("profile.edit.location")}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("profile.edit.locationPlaceholder")}
            />

            <Input
              id="edit-website"
              label={t("profile.edit.website")}
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder={t("profile.edit.websitePlaceholder")}
            />

            <div className="mt-2 flex gap-3">
              <Button
                type="button"
                variant="solid"
                color="muted"
                size="md"
                onClick={() => void navigate(-1)}
                disabled={isProfilePending}
                className="flex-1"
              >
                {t("profile.edit.cancel")}
              </Button>
              <Button type="submit" size="md" isLoading={isProfilePending} className="flex-1">
                {t("profile.edit.save")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
