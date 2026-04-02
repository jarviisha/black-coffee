import { useLocation } from "react-router"
import { LoginForm } from "./components/LoginForm"
import { RegisterForm } from "./components/RegisterForm"
import { LanguageDropdown, ThemeDropdown } from "@/widgets/DisplaySettings"

export function AuthPage() {
  const location = useLocation()

  const isRegister = location.pathname === "/register"

  return (
    <div className="bg-bg min-h-screen w-screen">
      {/* ── Right panel — form ── */}
      <div className="flex items-center justify-end gap-2 p-4">
        <LanguageDropdown />
        <ThemeDropdown />
      </div>

      <div className="mx-auto mt-20 w-100">
        <div className="w-full">{isRegister ? <RegisterForm /> : <LoginForm />}</div>
      </div>
    </div>
  )
}
