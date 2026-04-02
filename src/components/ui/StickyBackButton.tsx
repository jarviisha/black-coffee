import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

export function StickyBackButton() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className="absolute top-0 right-full bottom-0 -left-24 w-14">
      <div className="sticky top-[50%]">
        <Button
          variant="link"
          color="accent"
          size="sm"
          aria-label={t("common.back")}
          onClick={() => void navigate(-1)}
        >
          <Icon name="arrow-narrow-left" size={24} aria-hidden="true" />
          <span>{t("common.back")}</span>
        </Button>
      </div>
    </div>
  )
}
