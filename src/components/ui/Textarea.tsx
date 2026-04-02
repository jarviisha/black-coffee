import type { TextareaHTMLAttributes, ReactNode, Ref } from "react"
import { cn } from "@/lib/utils"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: Ref<HTMLTextAreaElement>
  label?: string
  labelAction?: ReactNode
  error?: string
  wrapperClassName?: string
}

function Textarea({
  ref,
  label,
  labelAction,
  error,
  id,
  wrapperClassName,
  className,
  ...props
}: TextareaProps) {
  const errorId = error && id ? `${id}-error` : undefined
  const hasLabel = !!(label ?? labelAction)

  return (
    <div className={wrapperClassName}>
      <div
        className={cn(
          "bg-input-bg relative rounded border-2 border-transparent transition-colors motion-reduce:transition-none",
          "focus-within:border-border-hi",
          error && "border-error",
        )}
      >
        {hasLabel ? (
          <div className="flex items-center justify-between px-4 pt-2.5">
            {label ? (
              <label htmlFor={id} className="text-text-muted text-xs font-medium tracking-widest">
                {label}
              </label>
            ) : null}
            {labelAction}
          </div>
        ) : null}

        <textarea
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={cn(
            "text-input-text w-full bg-transparent px-4 text-sm outline-none",
            "placeholder:text-text-sub",
            hasLabel ? "pt-1 pb-2.5" : "py-3",
            "min-h-20 resize-y",
            className,
          )}
          {...props}
        />
      </div>

      {error ? (
        <p id={errorId} className="text-error mt-1.5 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Textarea }
