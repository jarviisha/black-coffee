import { Navigate, Outlet } from "react-router"
import { useAuthStore } from "@/store/authStore"

export function ProtectedRoute() {
  const { isInitialized, accessToken } = useAuthStore()

  if (!isInitialized) return null

  if (!accessToken) return <Navigate to="/login" replace />

  return <Outlet />
}
