import { describe, expect, it } from "vitest"
import { safeExternalUrl } from "./safeUrl"

describe("safeExternalUrl", () => {
  it("passes ordinary web links through", () => {
    expect(safeExternalUrl("https://example.com/x?y=1")).toBe("https://example.com/x?y=1")
    expect(safeExternalUrl("http://example.com")).toBe("http://example.com")
  })

  // A javascript: href runs in the app origin when clicked, where the in-memory
  // access token lives — profile links are attacker-controlled text.
  it("rejects script-bearing schemes whatever the casing or padding", () => {
    expect(safeExternalUrl("javascript:alert(1)")).toBeNull()
    expect(safeExternalUrl("JavaScript:alert(1)")).toBeNull()
    expect(safeExternalUrl("  javascript:alert(1)")).toBeNull()
    expect(safeExternalUrl("java\tscript:alert(1)")).toBeNull()
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull()
    expect(safeExternalUrl("vbscript:msgbox(1)")).toBeNull()
  })

  it("rejects anything that is not a URL at all", () => {
    expect(safeExternalUrl("not a url")).toBeNull()
    expect(safeExternalUrl("")).toBeNull()
    expect(safeExternalUrl(undefined)).toBeNull()
  })

  it("assumes https for a bare host, the form users actually type", () => {
    expect(safeExternalUrl("example.com")).toBe("https://example.com")
  })
})
