import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router"
import { useTranslation } from "react-i18next"
import Icon from "@/components/ui/Icon"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "../hooks/useAuth"
import { createLoginSchema, type LoginInput } from "../schemas"
import { getApiErrorMessage } from "@/lib/utils"

export function LoginForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { login, isLoggingIn, loginError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

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
      <div className="mb-8">
        <h1 className="text-text mb-2 text-4xl leading-tight">{t("auth.login.title")}</h1>
        <p className="text-text-muted text-sm">{t("auth.login.subtitle")}</p>
      </div>

      {serverError && (
        <div className="border-error-border bg-error-fg text-error mb-5 rounded border px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <Input
        {...register("username")}
        id="login-username"
        label={t("auth.login.username")}
        type="text"
        autoComplete="username"
        placeholder={t("auth.login.usernamePlaceholder")}
        error={errors.username?.message}
        wrapperClassName="mb-5"
      />

      <Input
        {...register("password")}
        id="login-password"
        label={t("auth.login.password")}
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        placeholder={t("auth.login.passwordPlaceholder")}
        suffix={
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPassword((v) => !v)}
            className="text-text-sub hover:text-text h-auto w-auto p-0 motion-reduce:transition-none"
            aria-label={t(showPassword ? "auth.hidePassword" : "auth.showPassword")}
            aria-controls="login-password"
          >
            {showPassword ? <Icon name="eye-off" size={16} /> : <Icon name="eye" size={16} />}
          </Button>
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

      <p className="text-text-muted text-center text-sm">
        {t("auth.login.noAccount")}{" "}
        <Link
          to="/register"
          className="text-text font-medium underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
        >
          {t("auth.login.createOne")}
        </Link>
      </p>
    </form>
  )
}
