import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

export function BackHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 py-2">
      <Button
        variant="link"
        onClick={() => void navigate(-1)}
        className="text-text-muted hover:text-text flex items-center gap-2 px-0 text-lg"
      >
        <Icon name="arrow-narrow-left" size={20} aria-hidden="true" />
        <span>{t("common.back")}</span>
      </Button>
    </div>
  )
}
