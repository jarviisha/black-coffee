import type { TextareaHTMLAttributes, ReactNode, Ref } from "react"
import { cn } from "@/lib/utils"
import { FormField } from "./FormField"

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
    </FormField>
  )
}

export { Textarea }
