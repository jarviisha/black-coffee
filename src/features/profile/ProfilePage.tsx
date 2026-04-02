import { useState } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router"
import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { useGetUserProfile } from "@/api/hooks/useGetUserProfile"
import { useFollowUser } from "@/api/hooks/useFollowUser"
import { useUnfollowUser } from "@/api/hooks/useUnfollowUser"
import { useAuthStore } from "@/store/authStore"
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
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get("tab") as Tab | null) ?? "posts"

  // Optimistic follow state — keyed by username to reset on profile navigation
  const [localFollow, setLocalFollow] = useState<{
    forUsername: string
    isFollowing: boolean
    followerCount: number
  } | null>(null)

  const { mutate: followUser, isPending: isFollowPending } = useFollowUser()
  const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUser()

  const isOwnProfile = currentUser?.username === username

  // Use optimistic values when available for the current profile, else fall back to server data
  const hasLocalFollow = localFollow !== null && localFollow.forUsername === username
  const isFollowing = hasLocalFollow ? localFollow.isFollowing : (user?.is_following ?? false)
  const followerCount = hasLocalFollow ? localFollow.followerCount : (user?.follower_count ?? 0)

  const handleFollowToggle = () => {
    if (!user?.id) return
    const next = !isFollowing
    const nextCount = followerCount + (next ? 1 : -1)
    setLocalFollow({ forUsername: username!, isFollowing: next, followerCount: nextCount })
    const mutation = next ? followUser : unfollowUser
    mutation(
      { userKey: user.id },
      {
        onError: () =>
          setLocalFollow({ forUsername: username!, isFollowing: !next, followerCount }),
      },
    )
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
