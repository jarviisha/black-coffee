import { createBrowserRouter } from "react-router"
import { MainLayout } from "@/layout/MainLayout"
import { ProtectedRoute } from "@/auth/ProtectedRoute"
import { GuestRoute } from "@/auth/GuestRoute"
import { HomePage } from "@/features/feed/HomePage"
import { DiscoverPage } from "@/features/discover/DiscoverPage"
import { PostDetailPage } from "@/features/post/PostDetailPage"
import { ProfilePage } from "@/features/profile/ProfilePage"
import { EditProfilePage } from "@/features/profile/EditProfilePage"
import { AuthPage } from "@/features/auth/AuthPage"
import { NotificationsPage } from "@/features/notification/NotificationsPage"

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: "/login", element: <AuthPage /> },
      { path: "/register", element: <AuthPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <HomePage /> },
          { path: "/discover", element: <DiscoverPage /> },
          { path: "/notifications", element: <NotificationsPage /> },
          { path: "/post/:id", element: <PostDetailPage /> },
          { path: "/settings/profile", element: <EditProfilePage /> },
          { path: "/:username", element: <ProfilePage /> },
        ],
      },
    ],
  },
])
