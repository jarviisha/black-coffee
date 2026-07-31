import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { FormAlert } from "@/components/ui/FormAlert"
import { useForgotPassword } from "@/api/hooks/useForgotPassword"
import { createForgotPasswordSchema, type ForgotPasswordInput } from "../schemas"
import { getApiErrorMessage } from "@/lib/utils"
import { AuthHeader } from "./AuthHeader"
import { AuthSwitchLink } from "./AuthSwitchLink"

export function ForgotPasswordForm() {
  const { t } = useTranslation()
  const { mutate, isPending, error, isSuccess } = useForgotPassword()

  const schema = useMemo(() => createForgotPasswordSchema(t), [t])

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(schema),
  })

  const serverError = getApiErrorMessage(error)

  const onSubmit = (data: ForgotPasswordInput) => {
    mutate({ data })
  }

  // The API answers identically whether or not the address exists, so the
  // confirmation must not reveal anything beyond "we sent it if it was valid".
  if (isSuccess) {
    return (
      <div>
        <AuthHeader
          title={t("auth.forgotPassword.sentTitle")}
          subtitle={t("auth.forgotPassword.sentSubtitle", { email: getValues("email") })}
        />
        <AuthSwitchLink
          prompt={t("auth.forgotPassword.rememberedPrompt")}
          to="/login"
          label={t("auth.forgotPassword.backToLogin")}
        />
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <AuthHeader
        title={t("auth.forgotPassword.title")}
        subtitle={t("auth.forgotPassword.subtitle")}
      />

      {serverError && <FormAlert message={serverError} className="mb-5" />}

      <Input
        {...register("email")}
        id="forgot-email"
        label={t("auth.forgotPassword.email")}
        type="email"
        autoComplete="email"
        autoFocus
        placeholder={t("auth.forgotPassword.emailPlaceholder")}
        error={errors.email?.message}
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
        {isPending ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
      </Button>

      <AuthSwitchLink
        prompt={t("auth.forgotPassword.rememberedPrompt")}
        to="/login"
        label={t("auth.forgotPassword.backToLogin")}
      />
    </form>
  )
}
