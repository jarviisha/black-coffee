import { z } from "zod"
import type { TFunction } from "i18next"

export const VISIBILITY_OPTIONS = ["public", "followers", "private"] as const
export type Visibility = (typeof VISIBILITY_OPTIONS)[number]

export const MAX_POST_CHARS = 515

export function createPostSchema(t: TFunction, maxChars: number = MAX_POST_CHARS) {
  return z.object({
    content: z
      .string()
      .min(1, t("post.validation.contentRequired"))
      .max(maxChars, t("post.validation.contentMax", { max: maxChars })),
    media_keys: z.array(z.string()).optional(),
    mention_user_ids: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(VISIBILITY_OPTIONS),
  })
}

export type CreatePostInput = z.infer<ReturnType<typeof createPostSchema>>
