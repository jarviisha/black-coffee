import { cn } from "@/lib/utils"

interface SpinnerProps {
  /** sm=12px, md=20px, lg=24px */
  size?: "sm" | "md" | "lg"
  /** Wrap in a flex justify-center container */
  centered?: boolean
  className?: string
}

const sizeClass = {
  sm: "size-3",
  md: "size-5",
  lg: "size-6",
}

export function Spinner({ size = "md", centered = false, className }: SpinnerProps) {
  const spinner = (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-current border-t-transparent animate-spin motion-reduce:animate-none",
        sizeClass[size],
      )}
      aria-hidden="true"
    />
  )

  if (centered) {
    return (
      <div className={cn("flex items-center justify-center text-text-muted", className)}>
        {spinner}
      </div>
    )
  }

  return spinner
}
