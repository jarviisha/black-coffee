import { describe, expect, it } from "vitest"
import { shouldAttemptRefresh } from "./shouldAttemptRefresh"

const base = { status: 401, url: "/feed", alreadyRetried: false, hasSession: true }

describe("shouldAttemptRefresh", () => {
  it("refreshes an expired token on a normal request", () => {
    expect(shouldAttemptRefresh(base)).toBe(true)
  })

  it("ignores anything that is not a 401", () => {
    expect(shouldAttemptRefresh({ ...base, status: 403 })).toBe(false)
    expect(shouldAttemptRefresh({ ...base, status: 500 })).toBe(false)
    expect(shouldAttemptRefresh({ ...base, status: undefined })).toBe(false)
  })

  it("does not retry a request that already carried a fresh token", () => {
    expect(shouldAttemptRefresh({ ...base, alreadyRetried: true })).toBe(false)
  })

  it("leaves auth endpoints alone — a 401 there is bad credentials, and refreshing itself would deadlock", () => {
    expect(shouldAttemptRefresh({ ...base, url: "/auth/login" })).toBe(false)
    expect(shouldAttemptRefresh({ ...base, url: "/auth/refresh" })).toBe(false)
  })

  // Logging out clears the token but in-flight requests keep landing. Refreshing
  // one of those would hand the session straight back to a user who just left.
  it("does not refresh once the session is gone", () => {
    expect(shouldAttemptRefresh({ ...base, hasSession: false })).toBe(false)
  })

  it("treats a missing url as a non-auth request", () => {
    expect(shouldAttemptRefresh({ ...base, url: undefined })).toBe(true)
  })
})
