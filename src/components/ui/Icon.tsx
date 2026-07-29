import type { IconName } from "./icon-names"

export type { IconName }

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true">
      <use href={`/icons.svg#${name}`} />
    </svg>
  )
}
