import { useEffect } from "react"
import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute() {
  const { isInitialized, accessToken } = useAuthStore()

  // A page restored from the back/forward cache comes back with the React state
  // it was frozen with — including a session that has since been logged out.
  // Reloading re-runs auth initialization, which lands on /login when the
  // refresh cookie is gone.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) window.location.reload()
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  if (!isInitialized) return null

  if (!accessToken) return <Navigate to="/login" replace />

  return <Outlet />
}
