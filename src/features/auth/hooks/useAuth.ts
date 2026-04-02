import { useAuthStore } from "@/store/authStore"
import { useLogin } from "@/api/hooks/useLogin"
import { useRegister } from "@/api/hooks/useRegister"
import { useLogout } from "@/api/hooks/useLogout"
import { getMe } from "@/api/clients/getMe"
import { queryClient } from "@/lib/queryClient"
import type { LoginInput, RegisterInput } from "../schemas"

export function useAuth() {
  const { setTokens, setUser, logout: clearAuth } = useAuthStore()

  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const logoutMutation = useLogout()

  return {
    login: (input: LoginInput, opts?: { onSuccess?: () => void }) =>
      loginMutation.mutate(
        { data: input },
        {
          onSuccess: (data) => {
            if (data.access_token) {
              setTokens(data.access_token)
            }
            if (data.user) setUser(data.user)
            opts?.onSuccess?.()
          },
        },
      ),
    register: (input: RegisterInput, opts?: { onSuccess?: () => void }) =>
      registerMutation.mutate(
        { data: input },
        {
          onSuccess: (data) => {
            void (async () => {
              if (data.access_token) {
                setTokens(data.access_token)
                try {
                  const me = await getMe()
                  if (me) setUser(me)
                } catch {
                  // Non-critical — user will be fetched on next token refresh
                }
              }
              opts?.onSuccess?.()
            })()
          },
        },
      ),
    logout: () =>
      logoutMutation.mutate(
        { data: {} },
        {
          onSuccess: () => { clearAuth(); queryClient.removeQueries() },
          onError: () => { clearAuth(); queryClient.removeQueries() },
        },
      ),
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}
