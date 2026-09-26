import { useTranslation } from "react-i18next"
import { FeedList } from "./components/FeedList"
import { PageTitle } from "@/components/ui/PageTitle"
import { useComposeStore } from "@/store/composeStore"

export function HomePage() {
  const { t } = useTranslation()
  // Remounting on a new post is the whole reset: the list starts from page one
  // again, which is where the just-created post now sits.
  const postedAt = useComposeStore((s) => s.postedAt)

  return (
    <div className="mx-auto max-w-xl">
      <PageTitle title={t("nav.home")} />
      <FeedList key={postedAt ?? "initial"} />
    </div>
  )
}
