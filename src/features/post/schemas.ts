import { z } from "zod"
import type { TFunction } from "i18next"

export const VISIBILITY_OPTIONS = ["public", "followers", "private"] as const
export type Visibility = (typeof VISIBILITY_OPTIONS)[number]

export function createPostSchema(t: TFunction, maxChars?: number) {
  return z.object({
    content: z
      .string()
      .min(1, t("post.validation.contentRequired"))
      .max(maxChars ?? 515, t("post.validation.contentMax")),
    media_keys: z.array(z.string()).optional(),
    mention_user_ids: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(VISIBILITY_OPTIONS),
  })
}

export type CreatePostInput = z.infer<ReturnType<typeof createPostSchema>>
