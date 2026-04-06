import { timeAgo } from "@/lib/utils"
import { Avatar } from "@/components/ui/Avatar"
import { LinkedUserInfo } from "@/components/ui/UserInfo"

interface PostHeaderProps {
  author?: {
    id?: string
    avatar_url?: string
    display_name?: string
    username?: string
  }
  createdAt?: string
}

export function PostHeader({ author, createdAt }: PostHeaderProps) {
  const timeAgoStr = createdAt ? timeAgo(createdAt) : null

  return (
    <div className="flex items-center gap-3">
      <Avatar src={author?.avatar_url} name={author?.display_name} href={`/@${author?.username}`} />
      <LinkedUserInfo
        displayName={author?.display_name}
        username={author?.username}
        meta={timeAgoStr}
      />
    </div>
  )
}
