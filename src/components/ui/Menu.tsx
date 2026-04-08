import { createContext, use, useState, useRef, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/Button"

interface MenuContextValue {
  openSubmenu: string | null
  openSub: (name: string) => void
  closeSub: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

function useMenuContext() {
  const ctx = use(MenuContext)
  if (!ctx) throw new Error("Menu components must be used within a Menu.Root")
  return ctx
}

interface MenuRootProps {
  children: ReactNode
}

function MenuRoot({ children }: MenuRootProps) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openSub = (name: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenSubmenu(name)
  }

  const closeSub = () => {
    closeTimer.current = setTimeout(() => setOpenSubmenu(null), 120)
  }

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  return <MenuContext value={{ openSubmenu, openSub, closeSub }}>{children}</MenuContext>
}

function MenuContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menu"
      className={cn("bg-bg border-border z-50 flex flex-col rounded border shadow-lg", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface MenuItemProps extends ButtonProps {
  children: ReactNode
}

function MenuItem({ children, className, ...props }: MenuItemProps) {
  return (
    <Button
      role="menuitem"
      variant="ghost"
      color="muted"
      className={cn(
        "h-auto w-full justify-start rounded-none px-4 py-3 font-normal",
        "first:rounded-t-md last:rounded-b-md",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

function MenuSeparator() {
  return <div className="border-border border-t" />
}

interface MenuSubContextValue {
  value: string
  isOpen: boolean
}

const MenuSubContext = createContext<MenuSubContextValue | null>(null)

interface MenuSubProps {
  value: string
  children: ReactNode
}

function MenuSub({ value, children }: MenuSubProps) {
  const { openSubmenu, openSub, closeSub } = useMenuContext()
  const isOpen = openSubmenu === value

  return (
    <MenuSubContext value={{ value, isOpen }}>
      <div className="relative" onMouseEnter={() => openSub(value)} onMouseLeave={closeSub}>
        {children}
      </div>
    </MenuSubContext>
  )
}

type MenuSubTriggerProps = MenuItemProps

function MenuSubTrigger({ children, className, ...props }: MenuSubTriggerProps) {
  const ctx = use(MenuSubContext)
  if (!ctx) throw new Error("Menu.SubTrigger must be used inside Menu.Sub")

  return (
    <MenuItem
      aria-haspopup="menu"
      aria-expanded={ctx.isOpen}
      className={cn("rounded-none", ctx.isOpen && "bg-surface-hi text-text", className)}
      {...props}
    >
      {children}
    </MenuItem>
  )
}

function MenuSubContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = use(MenuSubContext)
  const menuCtx = useMenuContext()
  if (!ctx) throw new Error("Menu.SubContent must be used inside Menu.Sub")

  if (!ctx.isOpen) return null

  return (
    <div
      role="menu"
      onMouseEnter={() => menuCtx.openSub(ctx.value)}
      onMouseLeave={menuCtx.closeSub}
      className={cn(
        "bg-bg border-border absolute top-0 left-full z-50 flex w-44 flex-col rounded border shadow-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  MenuRoot as Root,
  MenuContent as Content,
  MenuItem as Item,
  MenuSeparator as Separator,
  MenuSub as Sub,
  MenuSubTrigger as SubTrigger,
  MenuSubContent as SubContent,
}
