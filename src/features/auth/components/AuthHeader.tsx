interface AuthHeaderProps {
  title: string
  subtitle: string
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-text mb-2 text-2xl leading-tight font-semibold">{title}</h1>
      <p className="text-text-muted text-sm">{subtitle}</p>
    </div>
  )
}
