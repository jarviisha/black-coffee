import { describe, expect, it } from "vitest"
import { decodedProfilePath } from "./profilePath"

describe("decodedProfilePath", () => {
  it("decodes an encoded profile path", () => {
    expect(decodedProfilePath("/%40jarviis")).toBe("/@jarviis")
  })

  it("accepts lowercase percent-encoding", () => {
    expect(decodedProfilePath("/%40jarviis")).toBe("/@jarviis")
    expect(decodedProfilePath("/%40Jarviis")).toBe("/@Jarviis")
  })

  it("leaves an already-decoded path alone so the effect cannot loop", () => {
    expect(decodedProfilePath("/@jarviis")).toBeNull()
  })

  it("ignores non-profile paths", () => {
    expect(decodedProfilePath("/discover")).toBeNull()
    expect(decodedProfilePath("/")).toBeNull()
    expect(decodedProfilePath("/post/123")).toBeNull()
  })

  it("ignores a bare or nested encoded segment", () => {
    expect(decodedProfilePath("/%40")).toBeNull()
    expect(decodedProfilePath("/%40jarviis/followers")).toBeNull()
  })

  it("round-trips to a URL the browser keeps unencoded", () => {
    // `@` is not in the WHATWG path percent-encode set, so history.replaceState
    // with this path leaves the address bar showing `@`.
    const decoded = decodedProfilePath("/%40jarviis")!
    expect(new URL(decoded, "https://example.com").pathname).toBe("/@jarviis")
  })
})
