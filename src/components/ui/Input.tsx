import type { InputHTMLAttributes, ReactNode, Ref } from "react"
import { cn } from "@/lib/utils"
import { FormField } from "./FormField"

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  ref?: Ref<HTMLInputElement>
  label?: string
  labelAction?: ReactNode
  prefix?: ReactNode
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
  const hasLabel = !!(label ?? labelAction)
  const errorId = error && id ? `${id}-error` : undefined

  return (
    <FormField
      label={label}
      labelAction={labelAction}
      error={error}
      id={id}
      wrapperClassName={wrapperClassName}
    >
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
    </FormField>
  )
}

export { Input }
