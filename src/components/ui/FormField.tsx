import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label?: string
  labelAction?: ReactNode
  error?: string
  id?: string
  wrapperClassName?: string
  children: ReactNode
}

export function FormField({
  label,
  labelAction,
  error,
  id,
  wrapperClassName,
  children,
}: FormFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined
  const hasLabel = !!(label ?? labelAction)

  return (
    <div className={wrapperClassName}>
      <div
        className={cn(
          "bg-input-bg relative rounded border-2 border-transparent transition-colors motion-reduce:transition-none",
          "focus-within:border-accent",
          error && "border-error",
        )}
      >
        {hasLabel ? (
          <div className="flex min-h-4 items-center px-4 pt-2.5">
            {label ? (
              <label htmlFor={id} className="text-text/70 text-xs font-semibold tracking-wide">
                {label}
              </label>
            ) : null}
          </div>
        ) : null}

        {children}

        {/* Sits in the label row visually, but comes after the input in the DOM
            so Tab moves straight to the next field instead of into this action */}
        {labelAction ? (
          <div className="absolute top-2.5 right-4 flex min-h-4 items-center">{labelAction}</div>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-error mt-1.5 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}
