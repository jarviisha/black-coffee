import { useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { LoginForm } from "./components/LoginForm"
import { RegisterForm } from "./components/RegisterForm"
import { LanguageDropdown, ThemeDropdown } from "@/widgets/DisplaySettings"

export function AuthPage() {
  const { t } = useTranslation()
  const location = useLocation()

  const isRegister = location.pathname === "/register"

  return (
    <div className="bg-bg flex min-h-screen">
      {/* ── Left panel — image ── */}
      <div className="hidden lg:block lg:w-3/5">
        <img src="/images/hero-image.png" alt="" className="h-full w-full object-cover" />
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex flex-1 flex-col px-6 py-8">
        <div className="flex items-center justify-end gap-2">
          <LanguageDropdown />
          <ThemeDropdown />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <span className="font-display text-text text-2xl italic">{t("common.brand")}.</span>
            </div>

            {isRegister ? <RegisterForm /> : <LoginForm />}
          </div>
        </div>
      </div>
    </div>
  )
}
