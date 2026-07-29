import { useGetMe } from "@/api/hooks/useGetMe"
import { useDropdown } from "@/hooks/useDropdown"
import { Avatar } from "@/components/ui/Avatar"
import { Button } from "@/components/ui/Button"
import { Icon } from "@/components/ui/Icon"
import { UserMenuPanel } from "./UserMenuPanel"
import { cn } from "@/lib/utils"

export function UserCard() {
  const { data: me } = useGetMe()
  const { open, setOpen, panelRef, triggerRef } = useDropdown()

  if (!me) return null

  return (
    <div className="relative">
      {open && <UserMenuPanel menuRef={panelRef} onClose={() => setOpen(false)} />}

      <Button
        ref={triggerRef}
        variant="ghost"
        color="muted"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="User menu"
        className={cn(
          "group h-auto w-full justify-start rounded px-2 py-3 font-normal",
          open && "bg-surface-hi",
        )}
      >
        <div className="flex w-full items-center gap-3">
          <Avatar src={me.avatar_url} name={me.display_name} size="md" />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-text truncate text-sm font-semibold">{me.display_name}</p>
            <p className="text-text-muted truncate text-xs">@{me.username}</p>
          </div>
          <Icon
            name="dots"
            size={16}
            className={cn(
              "text-text-muted shrink-0 transition-opacity motion-reduce:transition-none",
              open ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
            aria-hidden="true"
          />
        </div>
      </Button>
    </div>
  )
}
