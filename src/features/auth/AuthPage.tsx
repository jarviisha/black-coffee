import { useLocation } from "react-router"
import { AuthLayout } from "./components/AuthLayout"
import { LoginForm } from "./components/LoginForm"
import { RegisterForm } from "./components/RegisterForm"
import { ForgotPasswordForm } from "./components/ForgotPasswordForm"

type AuthView = "login" | "register" | "forgotPassword"

const views: Record<AuthView, () => React.JSX.Element> = {
  login: LoginForm,
  register: RegisterForm,
  forgotPassword: ForgotPasswordForm,
}

function viewFor(pathname: string): AuthView {
  if (pathname === "/register") return "register"
  if (pathname === "/forgot-password") return "forgotPassword"
  return "login"
}

export function AuthPage() {
  const { pathname } = useLocation()

  const view = viewFor(pathname)
  const Form = views[view]

  return (
    <AuthLayout transitionKey={view}>
      <Form />
    </AuthLayout>
  )
}
