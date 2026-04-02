import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { useGetTrendingHashtags } from "@/api/hooks/useGetTrendingHashtags"

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return String(count)
}

export function TrendingTags() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetTrendingHashtags()

  return (
    <div className="border-border rounded border p-4">
      <h3 className="border-border text-text mb-3 border-b px-2 text-lg font-medium">
        {t("discover.trending")}
      </h3>
      <div className="flex flex-col gap-1 px-2">
        {isLoading && <Spinner centered className="py-4" />}
        {isError && <p className="text-text-muted px-0 py-2 text-xs">{t("discover.loadError")}</p>}
        {data?.data?.map(({ name, count }) => (
          <Button
            key={name}
            variant="ghost"
            className="w-full justify-between border-0 px-0 hover:bg-transparent"
          >
            <p className="text-text text-sm">#{name}</p>
            <span className="text-text-muted text-xs">{formatCount(count ?? 0)}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
