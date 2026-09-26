import { useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { AuthLayout } from "./components/AuthLayout"
import { LoginForm } from "./components/LoginForm"
import { RegisterForm } from "./components/RegisterForm"
import { ForgotPasswordForm } from "./components/ForgotPasswordForm"
import { ResetPasswordForm } from "./components/ResetPasswordForm"
import { VerifyEmailForm } from "./components/VerifyEmailForm"
import { PageTitle } from "@/components/ui/PageTitle"

/**
 * One entry per auth route: which form renders and what the tab is called.
 * Every route in the router's guest group must appear here; "/login" is the
 * fallback for anything else that reaches this page.
 */
const VIEWS = {
  "/register": { Form: RegisterForm, titleKey: "auth.register.title" },
  "/forgot-password": { Form: ForgotPasswordForm, titleKey: "auth.forgotPassword.title" },
  "/reset-password": { Form: ResetPasswordForm, titleKey: "auth.resetPassword.title" },
  "/verify-email": { Form: VerifyEmailForm, titleKey: "auth.verifyEmail.title" },
  "/login": { Form: LoginForm, titleKey: "auth.login.title" },
} as const

export function AuthPage() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  const key = pathname in VIEWS ? (pathname as keyof typeof VIEWS) : "/login"
  const { Form, titleKey } = VIEWS[key]

  return (
    <AuthLayout transitionKey={key}>
      <PageTitle title={t(titleKey)} />
      <Form />
    </AuthLayout>
  )
}
