import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSearchParams } from "react-router"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/Button"
import { FormAlert } from "@/components/ui/FormAlert"
import { useResetPassword } from "@/api/hooks/useResetPassword"
import { createResetPasswordSchema, type ResetPasswordInput } from "../schemas"
import { apiErrorMessage } from "@/lib/utils"
import { AuthHeader } from "./AuthHeader"
import { AuthSwitchLink } from "./AuthSwitchLink"
import { PasswordField } from "./PasswordField"

export function ResetPasswordForm() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const { mutate, isPending, error, isSuccess } = useResetPassword()

  const schema = useMemo(() => createResetPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(schema),
  })

  const serverError = error ? apiErrorMessage(error, t("common.error")) : null

  const onSubmit = (data: ResetPasswordInput) => {
    if (!token) return
    mutate({ data: { token, new_password: data.password } })
  }

  // A link that lost its token cannot be recovered here — send them back to
  // request a fresh one rather than showing a form that can only fail.
  if (!token) {
    return (
      <div>
        <AuthHeader
          title={t("auth.resetPassword.invalidTitle")}
          subtitle={t("auth.resetPassword.invalidSubtitle")}
        />
        <AuthSwitchLink
          prompt={t("auth.resetPassword.invalidPrompt")}
          to="/forgot-password"
          label={t("auth.resetPassword.requestNew")}
        />
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div>
        <AuthHeader
          title={t("auth.resetPassword.doneTitle")}
          subtitle={t("auth.resetPassword.doneSubtitle")}
        />
        <AuthSwitchLink
          prompt={t("auth.rememberedPrompt")}
          to="/login"
          label={t("auth.backToLogin")}
        />
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <AuthHeader
        title={t("auth.resetPassword.title")}
        subtitle={t("auth.resetPassword.subtitle")}
      />

      {serverError && <FormAlert message={serverError} className="mb-5" />}

      <PasswordField
        {...register("password")}
        id="reset-password"
        label={t("auth.resetPassword.password")}
        autoComplete="new-password"
        autoFocus
        placeholder={t("auth.resetPassword.passwordPlaceholder")}
        error={errors.password?.message}
        wrapperClassName="mb-5"
      />

      <PasswordField
        {...register("confirmPassword")}
        id="reset-confirm-password"
        label={t("auth.resetPassword.confirmPassword")}
        autoComplete="new-password"
        placeholder={t("auth.resetPassword.confirmPasswordPlaceholder")}
        error={errors.confirmPassword?.message}
        wrapperClassName="mb-7"
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isPending}
        rightIcon={
          <Icon
            name="arrow-right"
            size={16}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        }
        className="mb-6 w-full"
      >
        {isPending ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
      </Button>

      <AuthSwitchLink
        prompt={t("auth.rememberedPrompt")}
        to="/login"
        label={t("auth.backToLogin")}
      />
    </form>
  )
}
