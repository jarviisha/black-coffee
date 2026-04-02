import type { InputHTMLAttributes, ReactNode, Ref } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  ref?: Ref<HTMLInputElement>
  label?: string
  /** Extra element rendered to the right of the label (e.g. "Forgot?" button) */
  labelAction?: ReactNode
  /** Element rendered inside the input on the left side (e.g. search icon) */
  prefix?: ReactNode
  /** Element rendered inside the input on the right side (e.g. password toggle) */
  suffix?: ReactNode
  error?: string
  wrapperClassName?: string
}

function Input({
  ref,
  label,
  labelAction,
  prefix,
  suffix,
  error,
  id,
  wrapperClassName,
  className,
  ...props
}: InputProps) {
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

        <div className={(prefix ?? suffix) ? "relative" : undefined}>
          {prefix ? (
            <div className="text-text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2">
              {prefix}
            </div>
          ) : null}
          <input
            ref={ref}
            id={id}
            aria-invalid={error ? true : undefined}
            aria-describedby={errorId}
            className={cn(
              "text-input-text w-full bg-transparent px-4 text-sm outline-none",
              "placeholder:text-text-sub",
              hasLabel ? "pt-1 pb-2.5" : "py-3",
              prefix && "pl-12",
              suffix && "pr-11",
              className,
            )}
            {...props}
          />
          {suffix ? (
            <div className="absolute top-1/2 right-3.5 -translate-y-1/2">{suffix}</div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p id={errorId} className="text-error mt-1.5 text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Input }
