interface RefreshDecision {
  /** HTTP status of the failed response, or undefined if it never arrived. */
  status: number | undefined
  /** Request URL, relative to the API base. */
  url: string | undefined
  /** True once this request has already been replayed with a fresh token. */
  alreadyRetried: boolean
  /** False once the user is logged out — see the session note below. */
  hasSession: boolean
}

/**
 * Whether a failed request should trigger a token refresh and be replayed.
 *
 * Split out of the interceptor so the rules are testable on their own: the
 * interceptor is otherwise only reachable through a live axios instance.
 */
export function shouldAttemptRefresh({
  status,
  url,
  alreadyRetried,
  hasSession,
}: RefreshDecision): boolean {
  if (status !== 401) return false
  if (alreadyRetried) return false
  // A 401 from /auth/login or /auth/register means bad credentials, not an
  // expired token, and refreshing /auth/refresh itself would deadlock.
  if (url?.startsWith("/auth/")) return false
  // Requests already in flight at logout keep landing afterwards. Refreshing
  // one of those would silently restore the session the user just ended.
  if (!hasSession) return false
  return true
}
