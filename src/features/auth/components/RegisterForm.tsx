import { useMemo, useState } from "react"
import { useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, Link } from "react-router"
import { useTranslation } from "react-i18next"
import Icon from "@/components/ui/Icon"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useAuth } from "../hooks/useAuth"
import { createRegisterSchema, type RegisterInput } from "../schemas"
import { getApiErrorMessage } from "@/lib/utils"

const strengthColors = ["", "bg-strength-1", "bg-strength-2", "bg-strength-3", "bg-strength-4"]

function calcStrength(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score
}

function PasswordStrengthBar({
  control,
  labels,
}: {
  control: Control<RegisterInput>
  labels: string[]
}) {
  const password = useWatch({ control, name: "password", defaultValue: "" })
  if (!password) return null
  const strength = calcStrength(password)
  return (
    <div className="mt-2 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`duration-slow h-0.5 flex-1 rounded-full transition-all motion-reduce:transition-none ${
              i <= strength ? strengthColors[strength] : "bg-border"
            }`}
          />
        ))}
      </div>
      <span className="text-text-muted text-xs">{labels[strength]}</span>
    </div>
  )
}

export function RegisterForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, isRegistering, registerError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const schema = useMemo(() => createRegisterSchema(t), [t])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(schema),
  })

  const serverError = getApiErrorMessage(registerError)

  const strengthLabels = [
    "",
    t("auth.strength.weak"),
    t("auth.strength.fair"),
    t("auth.strength.good"),
    t("auth.strength.strong"),
  ]

  const onSubmit = (data: RegisterInput) => {
    registerUser(data, { onSuccess: () => void navigate("/") })
  }

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
      <div className="mb-8">
        <h1 className="text-text mb-2 text-4xl leading-tight">{t("auth.register.title")}</h1>
        <p className="text-text-muted text-sm">{t("auth.register.subtitle")}</p>
      </div>
      {serverError && (
        <div className="border-error-border bg-error-fg text-error mb-5 rounded border px-4 py-3 text-sm">
          {serverError}
        </div>
      )}

      <Input
        {...register("username")}
        id="register-username"
        label={t("auth.register.username")}
        type="text"
        autoComplete="username"
        placeholder={t("auth.register.usernamePlaceholder")}
        error={errors.username?.message}
        wrapperClassName="mb-5"
      />

      <Input
        {...register("email")}
        id="register-email"
        label={t("auth.register.email")}
        type="email"
        autoComplete="email"
        placeholder={t("auth.register.emailPlaceholder")}
        error={errors.email?.message}
        wrapperClassName="mb-5"
      />

      <div className="mb-5">
        <Input
          {...register("password")}
          id="register-password"
          label={t("auth.register.password")}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          placeholder={t("auth.register.passwordPlaceholder")}
          suffix={
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPassword((v) => !v)}
              className="text-text-sub hover:text-text h-auto w-auto p-0 motion-reduce:transition-none"
              aria-label={t(showPassword ? "auth.hidePassword" : "auth.showPassword")}
              aria-controls="register-password"
            >
              {showPassword ? <Icon name="eye-off" size={16} /> : <Icon name="eye" size={16} />}
            </Button>
          }
          error={errors.password?.message}
        />
        <PasswordStrengthBar control={control} labels={strengthLabels} />
      </div>

      <Input
        {...register("confirmPassword")}
        id="register-confirm-password"
        label={t("auth.register.confirmPassword")}
        type={showConfirm ? "text" : "password"}
        autoComplete="new-password"
        placeholder={t("auth.register.passwordPlaceholder")}
        suffix={
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowConfirm((v) => !v)}
            className="text-text-sub hover:text-text h-auto w-auto p-0 motion-reduce:transition-none"
            aria-label={t(showConfirm ? "auth.hidePassword" : "auth.showPassword")}
            aria-controls="register-confirm-password"
          >
            {showConfirm ? <Icon name="eye-off" size={16} /> : <Icon name="eye" size={16} />}
          </Button>
        }
        error={errors.confirmPassword?.message}
        wrapperClassName="mb-7"
      />

      <Button
        type="submit"
        size="lg"
        isLoading={isRegistering}
        rightIcon={
          <Icon
            name="arrow-right"
            size={16}
            className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        }
        className="mb-6 w-full"
      >
        {isRegistering ? t("auth.register.submitting") : t("auth.register.submit")}
      </Button>

      <p className="text-text-muted text-center text-sm">
        {t("auth.register.hasAccount")}{" "}
        <Link
          to="/login"
          className="text-text font-medium underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
        >
          {t("auth.register.signIn")}
        </Link>
      </p>
    </form>
  )
}
