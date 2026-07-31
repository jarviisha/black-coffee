import { z } from "zod"
import type { TFunction } from "i18next"

// Login only checks for presence — length rules belong to register/reset,
// and echoing them here would leak the password policy to anyone at the login screen.
export function createLoginSchema(t: TFunction) {
  return z.object({
    username: z.string().min(1, t("auth.validation.required")),
    password: z.string().min(1, t("auth.validation.required")),
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

export function createForgotPasswordSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
  })
}

export type LoginInput = z.infer<ReturnType<typeof createLoginSchema>>
export type RegisterInput = z.infer<ReturnType<typeof createRegisterSchema>>
export type ForgotPasswordInput = z.infer<ReturnType<typeof createForgotPasswordSchema>>
