import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

interface ComposeButtonProps {
  onClick?: () => void
}

export function ComposeButton({ onClick }: ComposeButtonProps) {
  const { t } = useTranslation()

  return (
    <Button variant="solid" color="accent" onClick={onClick} className="w-full">
      <Icon name="plus" size={20} aria-hidden="true" />
      <span className="text-sm">{t("compose.placeholder")}</span>
    </Button>
  )
}
