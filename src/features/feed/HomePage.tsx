import { useTranslation } from "react-i18next"
import { FeedList } from "./components/FeedList"
import { PageTitle } from "@/components/ui/PageTitle"

export function HomePage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title={t("nav.home")} />
      <FeedList />
    </div>
  )
}
