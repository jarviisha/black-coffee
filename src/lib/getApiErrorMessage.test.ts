import { describe, expect, it } from "vitest"
import { AxiosError, AxiosHeaders } from "axios"
import { getApiErrorMessage, getApiErrorStatus } from "./utils"

function axiosErrorWith(data: unknown) {
  const headers = new AxiosHeaders()
  const config = { headers }
  return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
    data,
    status: 400,
    statusText: "Bad Request",
    headers,
    config,
  })
}

describe("getApiErrorMessage", () => {
  it("reads the nested darkvoid error shape", () => {
    const err = axiosErrorWith({
      error: { code: "SELF_LIKE", message: "you cannot like your own post" },
    })
    expect(getApiErrorMessage(err)).toBe("you cannot like your own post")
  })

  it("falls back to a flat message field", () => {
    expect(getApiErrorMessage(axiosErrorWith({ message: "plain failure" }))).toBe("plain failure")
  })

  it("prefers the nested message when both shapes are present", () => {
    const err = axiosErrorWith({ message: "outer", error: { message: "inner" } })
    expect(getApiErrorMessage(err)).toBe("inner")
  })

  it("returns null when the payload carries no usable message", () => {
    expect(getApiErrorMessage(axiosErrorWith({ error: { code: "OOPS" } }))).toBeNull()
    expect(getApiErrorMessage(axiosErrorWith({ message: "" }))).toBeNull()
    expect(getApiErrorMessage(axiosErrorWith(undefined))).toBeNull()
    expect(getApiErrorMessage(axiosErrorWith("not an object"))).toBeNull()
  })

  it("returns null for a network error with no response at all", () => {
    expect(getApiErrorMessage(new AxiosError("Network Error", "ERR_NETWORK"))).toBeNull()
  })

  it("ignores non-axios errors", () => {
    expect(getApiErrorMessage(new Error("boom"))).toBeNull()
    expect(getApiErrorMessage(null)).toBeNull()
  })
})

describe("getApiErrorStatus", () => {
  it("reports the response status", () => {
    expect(getApiErrorStatus(axiosErrorWith({}))).toBe(400)
  })

  it("returns null when the request never got a response", () => {
    expect(getApiErrorStatus(new AxiosError("Network Error", "ERR_NETWORK"))).toBeNull()
    expect(getApiErrorStatus(new Error("boom"))).toBeNull()
  })
})
