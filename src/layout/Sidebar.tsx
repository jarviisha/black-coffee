import { useMemo } from "react"
import { NavLink } from "react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/Icon"
import { useAuthStore } from "@/store/authStore"
import { useComposeStore } from "@/store/composeStore"
import { ComposeButton } from "@/widgets/ComposeButton"
import { UserCard } from "@/widgets/UserCard"
import { useGetUnreadCount } from "@/api/hooks/useGetUnreadCount"

export function Sidebar() {
  const { t } = useTranslation()
  const username = useAuthStore((s) => s.user?.username)
  const openCompose = useComposeStore((s) => s.open)

  const { data: unreadData } = useGetUnreadCount({
    query: { refetchInterval: 60_000 },
  })
  const unreadCount = unreadData?.unread_count ?? 0

  const navItems = useMemo(
    () => [
      { to: "/", iconName: "home", fillIconName: "home-fill", label: t("nav.home") },
      {
        to: "/discover",
        iconName: "compass",
        fillIconName: "compass-fill",
        label: t("nav.discover"),
      },
      {
        to: "/notifications",
        iconName: "bell",
        fillIconName: "bell-fill",
        label: t("nav.notifications"),
      },
      {
        to: `/@${username ?? ""}`,
        iconName: "user-2",
        fillIconName: "user-2-fill",
        label: t("nav.profile"),
        disabled: !username,
      },
    ],
    [t, username],
  )

  return (
    <nav className="flex h-full w-60 flex-col justify-between p-4">
      <div className="flex flex-col gap-8">
        {/* Brand */}
        <div className="gap-1 px-2 text-lg font-semibold underline">
          <Icon name="coffee" size={40} />
          <span>Black Coffee</span>
        </div>

        {/* Nav links */}
        <div className="border-border flex flex-col gap-2 border-b px-2 py-2">
          {navItems.map(({ to, iconName, fillIconName, label, disabled }) =>
            disabled ? (
              <span
                key={to}
                className="group text-text-sub relative flex cursor-default items-center gap-3 rounded px-3 py-2.5 text-base font-light"
                aria-disabled="true"
              >
                <Icon name={iconName} size={20} aria-hidden="true" />
                <span>{label}</span>
              </span>
            ) : (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "group focus-visible:ring-border-hi relative flex items-center gap-3 rounded py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
                    isActive
                      ? "text-text font-extrabold"
                      : "text-text/80 hover:text-text font-light hover:font-extrabold",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="relative shrink-0">
                      <Icon
                        name={isActive ? fillIconName : iconName}
                        size={24}
                        aria-hidden="true"
                      />
                      {iconName === "bell" && unreadCount > 0 && (
                        <span className="bg-error text-text absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[10px] leading-none font-bold">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </span>
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ),
          )}
        </div>
        <div>
          <ComposeButton onClick={openCompose} />
        </div>
      </div>
      <div>
        <UserCard />
      </div>
    </nav>
  )
}
