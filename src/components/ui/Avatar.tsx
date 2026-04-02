import { useState, type HTMLAttributes } from "react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"

const sizeMap = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-14 w-14 text-lg",
  "2xl": "h-36 w-36 text-xl",
} as const

type AvatarSize = keyof typeof sizeMap

interface AvatarProps extends HTMLAttributes<HTMLElement> {
  src?: string | null
  name?: string | null
  size?: AvatarSize
  href?: string
  className?: string
}

function AvatarImage({
  src,
  name,
  size = "md",
  className = "",
  ...props
}: Omit<AvatarProps, "href">) {
  const [errorSrc, setErrorSrc] = useState<string | null | undefined>(null)
  const sizeClass = sizeMap[size]

  if (src && src !== errorSrc) {
    return (
      <img
        src={src}
        alt={name ?? ""}
        className={cn(sizeClass, "rounded-full object-cover", className)}
        onError={() => setErrorSrc(src)}
        {...(props as HTMLAttributes<HTMLImageElement>)}
      />
    )
  }

  return (
    <div
      className={cn(
        sizeClass,
        "bg-surface-hi text-text-muted flex items-center justify-center rounded-full font-medium",
        className,
      )}
      {...props}
    >
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  )
}

export function Avatar({ src, name, size = "md", href, className, ...props }: AvatarProps) {
  if (href) {
    return (
      <Link to={href} className="block h-fit w-fit shrink-0" {...(props as object)}>
        <AvatarImage src={src} name={name} size={size} className={className} />
      </Link>
    )
  }

  return <AvatarImage src={src} name={name} size={size} className={className} {...props} />
}
