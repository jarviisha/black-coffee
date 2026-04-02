import { useNavigate } from "react-router"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/Icon"

interface PageHeaderProps {
  title: string
  /** Show a back button on the left */
  back?: boolean
  /** Slot for action buttons on the right */
  actions?: React.ReactNode
  /** "display" uses font-display italic for hero-style titles */
  titleVariant?: "default" | "display"
  className?: string
}

export function PageHeader({
  title,
  back = false,
  actions,
  titleVariant = "default",
  className,
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="border-border sticky top-0 z-50 border-b">
      <div
        className={cn(
          "bg-bg grid h-10 w-full grid-cols-[1fr_auto_1fr] items-stretch px-4 py-1",
          className,
        )}
      >
        {/* Left slot — back button or empty placeholder */}
        <div className="flex items-center justify-start">
          {back && (
            <button
              type="button"
              aria-label="Go back"
              className="flex h-8 w-8 items-center justify-center rounded-full"
              onClick={() => void navigate(-1)}
            >
              <Icon name="arrow-narrow-left" size={20} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Center slot — title always centered */}
        <div className="flex items-center justify-end">
          {/* <div className="bg-accent/60 flex h-8 min-w-60 items-center justify-center rounded backdrop-blur-xs"> */}
          <div className="flex h-8 min-w-60 items-center justify-center rounded">
            <h1
              className={cn(
                "truncate",
                titleVariant === "display"
                  ? "font-display text-text text-3xl font-bold italic"
                  : "text-base",
              )}
            >
              {title}
            </h1>
          </div>
        </div>

        {/* Right slot — actions or empty placeholder */}
        <div className="flex h-full items-center justify-end">
          <div className="flex h-8 w-8 items-center justify-center rounded-full">
            {actions}
            <Icon size={20} name="dots" />
          </div>
        </div>
      </div>
    </div>
  )
}
