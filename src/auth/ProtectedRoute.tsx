import { useEffect } from "react"
import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"
import { refreshToken } from "@/api/clients/refreshToken"

export function ProtectedRoute() {
  const { isInitialized, accessToken } = useAuthStore()

  // A page restored from the back/forward cache comes back with the React state
  // it was frozen with — including a session that has since been logged out.
  // Re-checking the session is enough; reloading would throw away an open
  // compose draft and trip the unsaved-changes prompt on the profile form.
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (!e.persisted) return
      const { setTokens, logout } = useAuthStore.getState()
      refreshToken()
        .then((data) => {
          if (data.access_token) setTokens(data.access_token)
        })
        .catch(() => logout())
    }
    window.addEventListener("pageshow", onPageShow)
    return () => window.removeEventListener("pageshow", onPageShow)
  }, [])

  if (!isInitialized) return null

  if (!accessToken) return <Navigate to="/login" replace />

  return <Outlet />
}
