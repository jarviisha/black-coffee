import type { ButtonHTMLAttributes, ReactNode, Ref } from "react"
import { cn } from "@/lib/utils"
import { Spinner } from "./Spinner"
import Icon from "./Icon"

interface ButtonIconProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  name: string
  iconSize?: number
  "aria-label": string
}

function ButtonIcon({ ref, name, iconSize, className, ...props }: ButtonIconProps) {
  return (
    <button ref={ref} type="button" className={className} {...props}>
      <Icon name={name} size={iconSize} />
    </button>
  )
}

type Variant = "solid" | "outline" | "ghost" | "link"
type Size = "sm" | "md" | "lg"
type Color = "accent" | "danger" | "muted" | "primary"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ref?: Ref<HTMLButtonElement>
  variant?: Variant
  size?: Size
  color?: Color
  isLoading?: boolean
  /** Icon shown on the left — should be aria-hidden */
  leftIcon?: ReactNode
  /** Icon shown on the right — should be aria-hidden */
  rightIcon?: ReactNode
}

const FOCUS_BASE = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-bg"
const DISABLED = "disabled:opacity-50 disabled:cursor-not-allowed"

const variantColorClass: Record<Variant, Record<Color, string>> = {
  solid: {
    accent: `bg-accent text-accent-fg hover:bg-accent/90 focus-visible:ring-accent focus-visible:ring-offset-2`,
    danger: `bg-error text-error-fg hover:bg-error/90 focus-visible:ring-error focus-visible:ring-offset-2`,
    muted: `bg-surface text-text-muted hover:bg-surface-hi hover:text-text focus-visible:ring-border-hi focus-visible:ring-offset-2`,
    primary: `bg-primary text-primary-fg hover:bg-primary/90 focus-visible:ring-primary focus-visible:ring-offset-2`,
  },
  outline: {
    accent: `border border-accent/40 text-accent hover:border-accent focus-visible:ring-accent focus-visible:ring-offset-2`,
    danger: `border border-error-border text-error hover:bg-error-fg hover:text-error focus-visible:ring-error focus-visible:ring-offset-2`,
    muted: `border border-border text-text-muted hover:bg-surface hover:border-border-hi hover:text-text focus-visible:ring-border-hi focus-visible:ring-offset-2`,
    primary: `border border-primary/40 text-primary hover:border-primary focus-visible:ring-primary focus-visible:ring-offset-2`,
  },
  ghost: {
    accent: `text-accent hover:bg-accent/10 focus-visible:ring-accent focus-visible:ring-offset-2`,
    danger: `text-error hover:bg-error-fg focus-visible:ring-error focus-visible:ring-offset-2`,
    muted: `text-text-muted hover:bg-surface hover:text-text focus-visible:ring-border-hi focus-visible:ring-offset-2`,
    primary: `text-primary hover:bg-primary/10 focus-visible:ring-primary focus-visible:ring-offset-2`,
  },
  link: {
    accent: `text-accent hover:text-accent/80 focus-visible:ring-accent focus-visible:ring-offset-1`,
    danger: `text-error hover:text-error/80 focus-visible:ring-error focus-visible:ring-offset-1`,
    muted: `text-text-sub hover:text-text-muted focus-visible:ring-border-hi focus-visible:ring-offset-1`,
    primary: `text-primary hover:text-primary/80 focus-visible:ring-primary focus-visible:ring-offset-1`,
  },
}

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-2 text-xs",
  md: "h-10 px-3 text-sm",
  lg: "h-12 px-4 text-sm font-semibold",
}

function Button({
  ref,
  variant = "solid",
  size = "md",
  color = "accent",
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      disabled={disabled ?? isLoading}
      aria-label={ariaLabel}
      aria-busy={isLoading || undefined}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-md font-bold transition-colors motion-reduce:transition-none",
        DISABLED,
        FOCUS_BASE,
        variantColorClass[variant][color],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {isLoading ? <Spinner aria-hidden="true" className="h-5 w-5 text-current" /> : leftIcon}
      {children}
      {!isLoading ? rightIcon : null}
    </button>
  )
}

export { Button, ButtonIcon }
