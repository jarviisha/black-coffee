import { cn } from "@/lib/utils"

interface FormAlertProps {
  message: string
  /** "error" for failures, "notice" for neutral confirmations */
  variant?: "error" | "notice"
  className?: string
}

/**
 * Announced form-level message. Rendered with role="alert" so screen readers
 * read server errors that appear after submit without moving focus.
 */
export function FormAlert({ message, variant = "error", className }: FormAlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded border px-4 py-3 text-sm",
        variant === "error" && "border-error-border bg-error-fg text-error",
        variant === "notice" && "border-border bg-surface text-text",
        className,
      )}
    >
      {message}
    </div>
  )
}
