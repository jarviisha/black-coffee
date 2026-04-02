import { useTranslation } from "react-i18next"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"
import { formatDate } from "@/lib/utils"
import type { DtoUserResponse } from "@/api/models/dto/UserResponse"

interface ProfileHeaderProps {
  user: DtoUserResponse
  followerCount: number
  isFollowing: boolean
  isOwnProfile: boolean
  isFollowPending: boolean
  onEditClick: () => void
  onFollowToggle: () => void
}

export function ProfileHeader({
  user,
  followerCount,
  isFollowing,
  isOwnProfile,
  isFollowPending,
  onEditClick,
  onFollowToggle,
}: ProfileHeaderProps) {
  const { t } = useTranslation()

  return (
    <div>
      {/* Cover photo */}
      <div className="bg-surface-hi relative h-52 cursor-pointer overflow-hidden rounded">
        {user.cover_url ? (
          <img
            src={user.cover_url}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="from-surface to-surface-hi h-full w-full bg-linear-to-br" />
        )}
      </div>

      {/* Avatar + action button row */}
      <div className="relative z-10 -mt-20 flex items-center justify-between px-4">
        <Avatar src={user.avatar_url} name={user.display_name} size="2xl" />
        <div className="mt-16 shrink-0 pb-1">
          {isOwnProfile ? (
            <Button variant="outline" size="sm" onClick={onEditClick}>
              {t("profile.editProfile")}
            </Button>
          ) : (
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "solid"}
              color={isFollowing ? "muted" : "accent"}
              isLoading={isFollowPending}
              onClick={onFollowToggle}
              className="w-24"
            >
              {isFollowing ? t("profile.unfollow") : t("profile.follow")}
            </Button>
          )}
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-4 px-4">
        <h1 className="text-text text-xl leading-tight font-semibold text-balance wrap-break-word">
          {user.display_name}
        </h1>
        <p className="text-text-muted truncate text-sm">@{user.username}</p>

        {user.bio && (
          <p className="text-text mt-2 text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        {/* Location / website / join date */}
        <div className="text-text-muted mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
          {user.location && (
            <span className="flex items-center gap-1.5">
              <Icon name="map-pin" size={12} aria-hidden="true" />
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text focus-visible:ring-accent flex items-center gap-1.5 transition-colors hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none"
            >
              <Icon name="link" size={12} aria-hidden="true" />
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {user.created_at && (
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" size={12} aria-hidden="true" />
              {t("profile.joined", { date: formatDate(user.created_at) })}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 flex gap-5 text-sm">
          <span className="min-w-0">
            <span className="text-text font-semibold">{user.following_count ?? 0}</span>
            <span className="text-text-muted ml-1">{t("profile.stats.following")}</span>
          </span>
          <span className="min-w-0">
            <span className="text-text font-semibold">{followerCount}</span>
            <span className="text-text-muted ml-1">{t("profile.stats.followers")}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
