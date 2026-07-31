import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { FormAlert } from "@/components/ui/FormAlert"
import { useAuth } from "../hooks/useAuth"
import { createLoginSchema, type LoginInput } from "../schemas"
import { getApiErrorMessage } from "@/lib/utils"
import { AuthHeader } from "./AuthHeader"
import { AuthSwitchLink } from "./AuthSwitchLink"
import { PasswordField } from "./PasswordField"

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isLoggingIn, loginError } = useAuth()

  const schema = useMemo(() => createLoginSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(schema),
  })

  const serverError = getApiErrorMessage(loginError)

  const onSubmit = (data: LoginInput) => {
    login(data, { onSuccess: () => void navigate("/") })
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <AuthHeader title={t("auth.login.title")} subtitle={t("auth.login.subtitle")} />

      {serverError && <FormAlert message={serverError} className="mb-5" />}

      <Input
        {...register("username")}
        id="login-username"
        label={t("auth.login.username")}
        type="text"
        autoComplete="username"
        autoFocus
        placeholder={t("auth.login.usernamePlaceholder")}
        error={errors.username?.message}
        wrapperClassName="mb-5"
      />

      <PasswordField
        {...register("password")}
        id="login-password"
        label={t("auth.login.password")}
        autoComplete="current-password"
        placeholder={t("auth.login.passwordPlaceholder")}
        labelAction={
          <Link
            to="/forgot-password"
            className="text-text-muted hover:text-text text-xs underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
          >
            {t("auth.login.forgot")}
          </Link>
        }
        error={errors.password?.message}
        wrapperClassName="mb-7"
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isLoggingIn}
        rightIcon={
          <Icon
            name="arrow-right"
            size={16}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        }
        className="mb-6 w-full"
      >
        {isLoggingIn ? t("auth.login.submitting") : t("auth.login.submit")}
      </Button>

      <AuthSwitchLink
        prompt={t("auth.login.noAccount")}
        to="/register"
        label={t("auth.login.createOne")}
      />
    </form>
  )
}
