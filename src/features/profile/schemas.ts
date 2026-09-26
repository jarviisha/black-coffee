import { z } from "zod"
import type { TFunction } from "i18next"
import { safeExternalUrl } from "@/lib/safeUrl"

export const MAX_DISPLAY_NAME = 50
export const MAX_BIO = 160
export const MAX_LOCATION = 50

export function createEditProfileSchema(t: TFunction) {
  return z.object({
    display_name: z
      .string()
      .min(1, t("auth.validation.required"))
      .max(
        MAX_DISPLAY_NAME,
        t("profile.edit.validation.displayNameMax", { max: MAX_DISPLAY_NAME }),
      ),
    bio: z.string().max(MAX_BIO, t("profile.edit.validation.bioMax", { max: MAX_BIO })),
    location: z
      .string()
      .max(MAX_LOCATION, t("profile.edit.validation.locationMax", { max: MAX_LOCATION })),
    // z.url() alone accepts javascript: and data:, which would land in an href.
    website: z.string().refine((v) => v === "" || safeExternalUrl(v) !== null, {
      message: t("profile.edit.validation.websiteInvalid"),
    }),
  })
}

export type EditProfileInput = z.infer<ReturnType<typeof createEditProfileSchema>>
