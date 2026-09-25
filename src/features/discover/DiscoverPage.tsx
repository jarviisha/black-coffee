import { useTranslation } from "react-i18next"
import { DiscoverList } from "./components/DiscoverList"
import { PageTitle } from "@/components/PageTitle"

export function DiscoverPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title={t("nav.discover")} />
      <DiscoverList />
    </div>
  )
}
