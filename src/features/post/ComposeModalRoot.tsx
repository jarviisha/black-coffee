import { lazy, Suspense } from "react"
import { useComposeStore } from "@/store/composeStore"

const CreatePostModal = lazy(() => import("./components/CreatePostModal"))

export function ComposeModalRoot() {
  const isOpen = useComposeStore((s) => s.isOpen)
  const close = useComposeStore((s) => s.close)

  if (!isOpen) return null

  return (
    <Suspense>
      <CreatePostModal onClose={close} />
    </Suspense>
  )
}
