import { useEffect, useRef } from "react"
import { useSearchParams } from "react-router"
import { useTranslation } from "react-i18next"
import { Spinner } from "@/components/ui/Spinner"
import { useVerifyEmail } from "@/api/hooks/useVerifyEmail"
import { getApiErrorMessage } from "@/lib/utils"
import { AuthHeader } from "./AuthHeader"
import { AuthSwitchLink } from "./AuthSwitchLink"

/** Landing page for the emailed {baseURL}/verify-email?token=… link. */
export function VerifyEmailForm() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const { mutate, isPending, isSuccess, error } = useVerifyEmail()
  const sent = useRef(false)

  useEffect(() => {
    if (!token || sent.current) return
    sent.current = true
    mutate({ data: { token } })
  }, [token, mutate])

  if (!token || error) {
    return (
      <div>
        <AuthHeader
          title={t("auth.verifyEmail.failedTitle")}
          subtitle={
            (error ? getApiErrorMessage(error) : null) ?? t("auth.verifyEmail.failedSubtitle")
          }
        />
        <AuthSwitchLink
          prompt={t("auth.forgotPassword.rememberedPrompt")}
          to="/login"
          label={t("auth.forgotPassword.backToLogin")}
        />
      </div>
    )
  }

  if (isPending || !isSuccess) {
    return (
      <div>
        <AuthHeader title={t("auth.verifyEmail.title")} subtitle={t("auth.verifyEmail.pending")} />
        <Spinner centered className="py-4" />
      </div>
    )
  }

  return (
    <div>
      <AuthHeader
        title={t("auth.verifyEmail.successTitle")}
        subtitle={t("auth.verifyEmail.successSubtitle")}
      />
      <AuthSwitchLink
        prompt={t("auth.forgotPassword.rememberedPrompt")}
        to="/login"
        label={t("auth.forgotPassword.backToLogin")}
      />
    </div>
  )
}
