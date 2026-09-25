import { useEffect } from "react"
import { useParams, useNavigate, useSearchParams, useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useGetUserProfile } from "@/api/hooks/useGetUserProfile"
import { useFollowUser } from "@/api/hooks/useFollowUser"
import { useUnfollowUser } from "@/api/hooks/useUnfollowUser"
import { useAuthStore } from "@/store/authStore"
import { useFollowStore } from "@/store/followStore"
import { decodedProfilePath } from "./profilePath"
import { ProfileHeader } from "./components/ProfileHeader"
import { UserPostsList } from "./components/UserPostsList"
import { Button } from "@/components/ui/Button"
import { Spinner } from "@/components/ui/Spinner"
import { PageHeader } from "@/components/ui/PageHeader"

type Tab = "posts" | "media"

export function ProfilePage() {
  const { t } = useTranslation()
  const { username: rawUsername } = useParams<{ username: string }>()
  // React Router v7 captures the leading `@` as part of the segment (e.g. "/@user" → "@user")
  const username = rawUsername?.startsWith("@") ? rawUsername.slice(1) : rawUsername
  const currentUser = useAuthStore((s) => s.user)

  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserProfile(username!, { by: "username" }, { query: { enabled: !!username } })

  const navigate = useNavigate()
  const { pathname, search, hash } = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get("tab") as Tab | null) ?? "posts"

  // Restore the `@` form of the URL after a hard load — see decodedProfilePath.
  // Client-side only, so it never hits the server and never redirects back.
  useEffect(() => {
    const decoded = decodedProfilePath(pathname)
    if (decoded) void navigate(`${decoded}${search}${hash}`, { replace: true })
  }, [pathname, search, hash, navigate])

  // Follow state is shared with the post cards below — see followStore.
  const followOverride = useFollowStore((s) => (user?.id ? s.overrides[user.id] : undefined))
  const setFollowing = useFollowStore((s) => s.setFollowing)

  const { mutate: followUser, isPending: isFollowPending } = useFollowUser()
  const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUser()

  const isOwnProfile = currentUser?.username === username

  const serverFollowing = user?.is_following ?? false
  const isFollowing = followOverride ?? serverFollowing
  // The server count already accounts for serverFollowing, so only adjust it
  // while a session override disagrees with what the server last told us.
  const followerCount =
    (user?.follower_count ?? 0) + (isFollowing === serverFollowing ? 0 : isFollowing ? 1 : -1)

  const handleFollowToggle = () => {
    if (!user?.id) return
    const userId = user.id
    const next = !isFollowing
    setFollowing(userId, next)
    const mutation = next ? followUser : unfollowUser
    mutation({ userKey: userId }, { onError: () => setFollowing(userId, !next) })
  }

  if (isLoading) {
    return (
      <div className="relative mx-auto max-w-xl">
        <Spinner size="lg" centered className="py-20" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="relative mx-auto max-w-xl">
        <div className="text-text-muted py-20 text-center text-sm">{t("profile.notFound")}</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title={user.username ?? ""} back />
      <div className="relative mx-auto max-w-xl">
        <div className="mt-4">
          <ProfileHeader
            user={user}
            followerCount={followerCount}
            isFollowing={isFollowing}
            isOwnProfile={isOwnProfile}
            isFollowPending={isFollowPending || isUnfollowPending}
            onEditClick={() => void navigate("/settings/profile")}
            onFollowToggle={handleFollowToggle}
          />
        </div>
        {/* Tab navigation */}
        <div
          role="tablist"
          aria-label={t("profile.tabs.label")}
          className="border-border mt-4 flex border-y"
        >
          {(["posts", "media"] as Tab[]).map((tab) => (
            <Button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab}`}
              id={`tab-${tab}`}
              variant="link"
              onClick={() => setSearchParams({ tab })}
              className={cn(
                "rounded-none px-5 py-6 text-sm font-medium",
                activeTab === tab ? "border-accent text-text border-b-2" : "text-text-muted",
              )}
            >
              {tab === "posts" ? t("profile.tabs.posts") : t("profile.tabs.media")}
            </Button>
          ))}
        </div>

        {/* Tab content */}
        <div
          role="tabpanel"
          id="tabpanel-posts"
          aria-labelledby="tab-posts"
          hidden={activeTab !== "posts"}
        >
          {user.id ? (
            <UserPostsList userID={user.id} />
          ) : (
            <div className="text-text-muted py-16 text-center text-sm">{t("profile.noPosts")}</div>
          )}
        </div>

        <div
          role="tabpanel"
          id="tabpanel-media"
          aria-labelledby="tab-media"
          hidden={activeTab !== "media"}
        >
          <div className="text-text-muted py-16 text-center text-sm">{t("profile.noMedia")}</div>
        </div>
      </div>
    </div>
  )
}
