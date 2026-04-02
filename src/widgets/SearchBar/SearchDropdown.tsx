import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { Spinner } from "@/components/ui/Spinner"
import type { SearchQueryResponse } from "@/api/models/Search"

interface SearchDropdownProps {
  showRecent: boolean
  showSearch: boolean
  isLoading: boolean
  hasAny: boolean
  hasUsers: boolean
  hasHashtags: boolean
  recent: string[]
  activeIndex: number
  userCount: number
  debouncedQuery: string
  data: SearchQueryResponse | undefined
  onClearRecent: () => void
  onRecentClick: (q: string) => void
  onUserClick: (username: string) => void
  onHashtagClick: (tag: string) => void
}

export function SearchDropdown({
  showRecent,
  showSearch,
  isLoading,
  hasAny,
  hasUsers,
  hasHashtags,
  recent,
  activeIndex,
  userCount,
  debouncedQuery,
  data,
  onClearRecent,
  onRecentClick,
  onUserClick,
  onHashtagClick,
}: SearchDropdownProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-bg border-border-hi absolute top-full right-0 left-0 z-50 mt-1.5 overflow-hidden rounded border shadow-md">
      {showRecent && (
        <>
          <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
            <span className="text-text-muted text-xs font-medium tracking-widest">
              {t("discover.recentSearches")}
            </span>
            <Button
              variant="link"
              onClick={onClearRecent}
              className="text-text-sub hover:text-text-muted h-auto p-0 text-xs"
            >
              {t("discover.clearAll")}
            </Button>
          </div>
          <ul className="pb-1.5">
            {recent.map((q, i) => (
              <li key={q}>
                <Button
                  variant="ghost"
                  onClick={() => onRecentClick(q)}
                  className={cn(
                    "hover:bg-surface-hi h-auto w-full justify-start gap-2.5 rounded-none border-0 px-3 py-1.5",
                    activeIndex === i && "bg-surface-hi",
                  )}
                >
                  <span className="text-text-muted truncate text-sm">{q}</span>
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}

      {showSearch && (
        <>
          {isLoading && <Spinner centered className="py-4" />}

          {!isLoading && !hasAny && (
            <p className="text-text-muted px-3 py-4 text-center text-xs">
              {t("discover.noResults", { query: debouncedQuery })}
            </p>
          )}

          {hasUsers && (
            <section>
              <p className="text-text-muted px-3 pt-2.5 pb-1 text-xs font-medium tracking-widest">
                {t("discover.sections.users")}
              </p>
              <ul className="pb-1">
                {data?.users?.map((user, i) => (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => user.username && onUserClick(user.username)}
                      className={cn(
                        "hover:bg-surface-hi flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                        activeIndex === i && "bg-surface-hi",
                      )}
                    >
                      <Avatar src={user.avatar_url} name={user.display_name} size="sm" />
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="text-text truncate text-sm font-medium">
                          {user.display_name}
                        </p>
                        <p className="text-text-muted truncate text-sm">@{user.username}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasHashtags && (
            <section>
              <p className="text-text-muted px-3 pt-2 pb-1 text-xs font-medium tracking-widest">
                {t("discover.sections.hashtags")}
              </p>
              <ul className="pb-1.5">
                {data?.hashtags?.map((tag, i) => (
                  <li key={tag}>
                    <button
                      type="button"
                      onClick={() => onHashtagClick(tag)}
                      className={cn(
                        "hover:bg-surface-hi flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                        activeIndex === userCount + i && "bg-surface-hi",
                      )}
                    >
                      <span className="text-text text-sm">#{tag}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
