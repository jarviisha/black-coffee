import { useTranslation } from "react-i18next"
import { NotificationList } from "./components/NotificationList"
import { PageHeader } from "@/components/ui/PageHeader"
import { PageTitle } from "@/components/ui/PageTitle"

export function NotificationsPage() {
  const { t } = useTranslation()

  return (
    <div>
      <PageTitle title={t("notification.title")} />
      <PageHeader title={t("notification.title")} back />
      <div className="mx-auto max-w-xl">
        <div>
          <NotificationList />
        </div>
      </div>
    </div>
  )
}
