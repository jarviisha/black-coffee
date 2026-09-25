import { useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "./components/AuthLayout"
import { LoginForm } from "./components/LoginForm"
import { RegisterForm } from "./components/RegisterForm"
import { ForgotPasswordForm } from "./components/ForgotPasswordForm"
import { ResetPasswordForm } from "./components/ResetPasswordForm"
import { VerifyEmailForm } from "./components/VerifyEmailForm"
import { PageTitle } from "@/components/PageTitle"

type AuthView = "login" | "register" | "forgotPassword" | "resetPassword" | "verifyEmail"

const views: Record<AuthView, () => React.JSX.Element> = {
  login: LoginForm,
  register: RegisterForm,
  forgotPassword: ForgotPasswordForm,
  resetPassword: ResetPasswordForm,
  verifyEmail: VerifyEmailForm,
}

function viewFor(pathname: string): AuthView {
  if (pathname === "/register") return "register"
  if (pathname === "/forgot-password") return "forgotPassword"
  if (pathname === "/reset-password") return "resetPassword"
  if (pathname === "/verify-email") return "verifyEmail"
  return "login"
}

const titleKeys = {
  login: "auth.login.title",
  register: "auth.register.title",
  forgotPassword: "auth.forgotPassword.title",
  resetPassword: "auth.resetPassword.title",
  verifyEmail: "auth.verifyEmail.title",
} as const satisfies Record<AuthView, string>

export function AuthPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const view = viewFor(pathname)
  const Form = views[view]

  return (
    <AuthLayout transitionKey={view}>
      <PageTitle title={t(titleKeys[view])} />
      <Form />
    </AuthLayout>
  )
}
