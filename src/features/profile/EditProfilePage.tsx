import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate, useBlocker } from "react-router"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Icon } from "@/components/ui/Icon"
import { useUpdateMyProfile } from "@/api/hooks/useUpdateMyProfile"
import { useUploadAvatar } from "@/api/hooks/useUploadAvatar"
import { useUploadCover } from "@/api/hooks/useUploadCover"
import { useAuthStore } from "@/store/authStore"
import { PageHeader } from "@/components/ui/PageHeader"
import { apiErrorMessage } from "@/lib/utils"
import { PageTitle } from "@/components/ui/PageTitle"
import { createEditProfileSchema, type EditProfileInput } from "./schemas"

export function EditProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  // Invalidate any cached /users/:userKey/profile queries so ProfilePage refetches fresh data
  const invalidateProfileQueries = () => {
    void queryClient.invalidateQueries({
      predicate: (q) => {
        const first = q.queryKey[0]
        return (
          typeof first === "object" &&
          first !== null &&
          "url" in first &&
          (first as { url: string }).url === "/users/:userKey/profile"
        )
      },
    })
  }

  const schema = useMemo(() => createEditProfileSchema(t), [t])
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: user?.display_name ?? "",
      bio: user?.bio ?? "",
      location: user?.location ?? "",
      website: user?.website ?? "",
    },
  })

  // Local previews while upload is in-flight
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const { mutate: updateProfile, isPending: isProfilePending } = useUpdateMyProfile()

  // Leaving with edited text fields used to discard them without a word. The
  // blocker callback runs at navigation time, after a save has already reset
  // the form, so it reads a ref rather than a closed-over render value.
  const isDirtyRef = useRef(isDirty)

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== "blocked") return
    if (window.confirm(t("profile.edit.discardChanges"))) blocker.proceed()
    else blocker.reset()
  }, [blocker, t])

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) e.preventDefault()
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [])
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
          invalidateProfileQueries()
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
          invalidateProfileQueries()
        },
      },
    )
  }

  // --- Form submit (text fields only) ---

  const onSubmit = (values: EditProfileInput) => {
    updateProfile(
      {
        data: {
          display_name: values.display_name || undefined,
          bio: values.bio || undefined,
          location: values.location || undefined,
          website: values.website || undefined,
        },
      },
      {
        onSuccess: (updated) => {
          setUser(updated)
          invalidateProfileQueries()
          // Clears isDirty before navigating, so the blocker stays out of the way.
          reset(values)
          isDirtyRef.current = false
          void navigate(-1)
        },
        onError: (err) => toast.error(apiErrorMessage(err, t("common.error"))),
      },
    )
  }

  const avatarSrc = avatarPreview ?? user?.avatar_url
  const coverSrc = coverPreview ?? user?.cover_url

  return (
    <div>
      <PageTitle title={t("profile.edit.title")} />
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
            aria-hidden="true"
            tabIndex={-1}
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
              aria-hidden="true"
              tabIndex={-1}
              onChange={handleAvatarChange}
            />
          </div>
        </div>

        {/* ── Section 2: Profile info ── */}
        <div className="border-border mt-16">
          <div className="border-border border-b px-4">
            <h1 className="text-lg font-semibold">{t("profile.edit.personalInformation")}</h1>
          </div>
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="mt-2 flex flex-col gap-5"
            noValidate
          >
            <Input
              {...register("display_name")}
              id="edit-display-name"
              label={t("profile.edit.displayName")}
              placeholder={t("profile.edit.displayNamePlaceholder")}
              error={errors.display_name?.message}
            />

            <Textarea
              {...register("bio")}
              id="edit-bio"
              label={t("profile.edit.bio")}
              placeholder={t("profile.edit.bioPlaceholder")}
              rows={4}
              className="resize-none"
              error={errors.bio?.message}
            />

            <Input
              {...register("location")}
              id="edit-location"
              label={t("profile.edit.location")}
              placeholder={t("profile.edit.locationPlaceholder")}
              error={errors.location?.message}
            />

            <Input
              {...register("website")}
              id="edit-website"
              label={t("profile.edit.website")}
              type="url"
              placeholder={t("profile.edit.websitePlaceholder")}
              error={errors.website?.message}
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
