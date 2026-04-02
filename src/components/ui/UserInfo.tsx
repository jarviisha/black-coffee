import { Link } from "react-router"

interface UserInfoProps {
  displayName?: string | null
  username?: string | null
  /** Extra text shown after @username (e.g. relative time "· 2h ago") */
  meta?: string | null
  size?: "sm" | "md"
}

function UserInfoBase({
  username,
  meta,
  nameEl,
}: Pick<UserInfoProps, "username" | "meta"> & { nameEl: React.ReactNode }) {
  const subClass = "text-xs text-text-muted"

  return (
    <div className="min-w-0 flex-1">
      {nameEl}
      <p className={subClass}>
        {username && <span>@{username}</span>}
        {meta && <span className="before:mx-1.5 before:content-['·']">{meta}</span>}
      </p>
    </div>
  )
}

/** Plain user info — no links */
export function UserInfo({ displayName, username, meta, size = "md" }: UserInfoProps) {
  const nameClass =
    size === "sm" ? "text-xs font-semibold text-text" : "text-sm font-semibold text-text"

  return (
    <UserInfoBase
      username={username}
      meta={meta}
      nameEl={<span className={nameClass}>{displayName}</span>}
    />
  )
}

/** User info with display name and username linking to /profile/:username */
export function LinkedUserInfo({ displayName, username, meta, size = "md" }: UserInfoProps) {
  const nameClass =
    size === "sm" ? "text-xs font-semibold text-text" : "text-sm font-semibold text-text"

  return (
    <UserInfoBase
      username={username}
      meta={meta}
      nameEl={
        <Link to={`/@${username}`} className={`${nameClass} underline-offset-2 hover:underline`}>
          {displayName}
        </Link>
      }
    />
  )
}
