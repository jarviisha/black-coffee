import { Link } from "react-router"

interface AuthSwitchLinkProps {
  prompt: string
  to: string
  label: string
}

export function AuthSwitchLink({ prompt, to, label }: AuthSwitchLinkProps) {
  return (
    <p className="text-text-muted text-center text-sm">
      {prompt}{" "}
      <Link
        to={to}
        className="text-text font-medium underline-offset-2 transition-colors hover:underline motion-reduce:transition-none"
      >
        {label}
      </Link>
    </p>
  )
}
