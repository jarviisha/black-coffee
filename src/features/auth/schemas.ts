import { z } from "zod"
import type { TFunction } from "i18next"

export function createLoginSchema(t: TFunction) {
  return z.object({
    username: z.string().min(1, t("auth.validation.required")),
    password: z.string().min(8, t("auth.validation.passwordMin")),
  })
}

export function createRegisterSchema(t: TFunction) {
  return z
    .object({
      username: z
        .string()
        .min(3, t("auth.validation.usernameMin"))
        .max(30, t("auth.validation.usernameMax")),
      email: z.string().email(t("auth.validation.emailInvalid")),
      password: z.string().min(8, t("auth.validation.passwordMin")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmPassword"],
    })
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>
