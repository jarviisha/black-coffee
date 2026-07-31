import { useState, type InputHTMLAttributes, type ReactNode, type Ref } from "react"
import { useTranslation } from "react-i18next"
import { ButtonIcon } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  ref?: Ref<HTMLInputElement>
  /** Required — the toggle points at it via aria-controls */
  id: string
  label: string
  labelAction?: ReactNode
  error?: string
  wrapperClassName?: string
}

/** Password input with a show/hide toggle. Owns its own visibility state. */
export function PasswordField({ ref, id, ...props }: PasswordFieldProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <Input
      ref={ref}
      id={id}
      type={visible ? "text" : "password"}
      suffix={
        <ButtonIcon
          name={visible ? "eye-off" : "eye"}
          iconSize={16}
          onClick={() => setVisible((v) => !v)}
          aria-label={t(visible ? "auth.hidePassword" : "auth.showPassword")}
          aria-controls={id}
          className="text-text-sub hover:text-text flex items-center transition-colors motion-reduce:transition-none"
        />
      }
      {...props}
    />
  )
}
