import { Outlet } from "react-router"
import { Sidebar } from "./Sidebar"
import { RightPanel } from "./RightPanel"
import { ComposeModalRoot } from "@/features/post/ComposeModalRoot"
import { useSSENotifications } from "@/features/notification"

export function MainLayout() {
  useSSENotifications()

  return (
    <div className="mx-auto flex min-h-screen w-350">
      <aside className="border-border sticky top-0 h-screen shrink-0 border-r px-4">
        <Sidebar />
      </aside>
      <main className="flex-1">
        <Outlet />
      </main>
      <RightPanel />
      <ComposeModalRoot />
    </div>
  )
}
