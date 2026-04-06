import { Link, useNavigate } from "react-router"

const MENTION_HASHTAG_RE = /([@#][\w]+)/g

interface PostContentProps {
  content: string
  postId: string
}

export function PostContent({ content, postId }: PostContentProps) {
  const navigate = useNavigate()
  const parts = content.split(MENTION_HASHTAG_RE)

  return (
    <div className="cursor-pointer py-3" onClick={() => void navigate(`/post/${postId}`)}>
      <p className="text-text text-sm leading-relaxed whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.startsWith("@")) {
            return (
              <Link
                key={i}
                to={`/@${part.slice(1)}`}
                onClick={(e) => e.stopPropagation()}
                className="text-mention hover:bg-mention-bg rounded-sm px-0.5 font-medium transition-colors hover:underline motion-reduce:transition-none"
              >
                {part}
              </Link>
            )
          }
          if (part.startsWith("#")) {
            return (
              <span
                key={i}
                role="button"
                onClick={(e) => {
                  e.stopPropagation()
                  void navigate(`/discover?tag=${part.slice(1)}`)
                }}
                className="text-hashtag hover:bg-hashtag-bg cursor-pointer rounded-sm px-0.5 font-medium transition-colors hover:underline motion-reduce:transition-none"
              >
                {part}
              </span>
            )
          }
          return part
        })}
      </p>
    </div>
  )
}
