import { Link, isRouteErrorResponse, useRouteError } from "react-router"
import { useTranslation } from "react-i18next"
import { Icon } from "@/components/ui/Icon"
import { brand } from "@/config/brand"
import { PageTitle } from "@/components/ui/PageTitle"

/**
 * Serves both roles: the catch-all `*` route (no error to read) and the
 * router's errorElement, which otherwise falls back to React Router's raw
 * "Unexpected Application Error" screen.
 */
export function ErrorPage({ notFound = false }: { notFound?: boolean }) {
  const { t } = useTranslation()
  const error = useRouteError()
  const isNotFound = notFound || (isRouteErrorResponse(error) && error.status === 404)

  return (
    <div className="bg-bg flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <PageTitle title={t(isNotFound ? "error.notFoundTitle" : "error.unexpectedTitle")} />
      <span className="text-text flex items-center gap-2 text-sm font-semibold">
        <Icon name={brand.logo} size={18} />
        {brand.name}
      </span>

      <div className="flex flex-col gap-2">
        <h1 className="text-text text-2xl font-bold">
          {t(isNotFound ? "error.notFoundTitle" : "error.unexpectedTitle")}
        </h1>
        <p className="text-text-muted max-w-100 text-sm">
          {t(isNotFound ? "error.notFoundSubtitle" : "error.unexpectedSubtitle")}
        </p>
      </div>

      <Link
        to="/"
        className="text-text text-sm font-medium underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
      >
        {t("error.backHome")}
      </Link>
    </div>
  )
}
