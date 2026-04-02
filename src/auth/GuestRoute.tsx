import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"

export function GuestRoute() {
  const { isInitialized, accessToken } = useAuthStore()

  if (!isInitialized) return null

  if (accessToken) return <Navigate to="/" replace />

  return <Outlet />
}
