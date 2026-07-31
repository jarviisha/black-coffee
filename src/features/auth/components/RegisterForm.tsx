import { useMemo } from "react"
import { useForm, useWatch, type Control } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { FormAlert } from "@/components/ui/FormAlert"
import { useAuth } from "../hooks/useAuth"
import { createRegisterSchema, type RegisterInput } from "../schemas"
import { cn, getApiErrorMessage } from "@/lib/utils"
import { AuthHeader } from "./AuthHeader"
import { AuthSwitchLink } from "./AuthSwitchLink"
import { PasswordField } from "./PasswordField"

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
  const strength = password ? calcStrength(password) : 0

  // Always rendered at a fixed height so typing the first character neither
  // reveals nor resizes the row — nothing below it moves
  return (
    <div
      className={cn(
        "duration-base mt-2 flex h-5 items-center gap-2 transition-opacity motion-reduce:transition-none",
        password ? "opacity-100" : "opacity-0",
      )}
    >
      <div className="flex flex-1 gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "duration-slow h-0.5 flex-1 rounded-full transition-all motion-reduce:transition-none",
              i <= strength ? strengthColors[strength] : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="text-text-muted text-xs" aria-live="polite">
        {password ? labels[strength] : ""}
      </span>
    </div>
  )
}

export function RegisterForm() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { register: registerUser, isRegistering, registerError } = useAuth()

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
      <AuthHeader title={t("auth.register.title")} subtitle={t("auth.register.subtitle")} />

      {serverError && <FormAlert message={serverError} className="mb-5" />}

      <Input
        {...register("username")}
        id="register-username"
        label={t("auth.register.username")}
        type="text"
        autoComplete="username"
        autoFocus
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
        <PasswordField
          {...register("password")}
          id="register-password"
          label={t("auth.register.password")}
          autoComplete="new-password"
          placeholder={t("auth.register.passwordPlaceholder")}
          error={errors.password?.message}
        />
        <PasswordStrengthBar control={control} labels={strengthLabels} />
      </div>

      <PasswordField
        {...register("confirmPassword")}
        id="register-confirm-password"
        label={t("auth.register.confirmPassword")}
        autoComplete="new-password"
        placeholder={t("auth.register.confirmPasswordPlaceholder")}
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

      <AuthSwitchLink
        prompt={t("auth.register.hasAccount")}
        to="/login"
        label={t("auth.register.signIn")}
      />
    </form>
  )
}
