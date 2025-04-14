import { describe, it, expect, vi, beforeEach } from "vitest"
import { getAuthToken, getClientHeader } from "~/resources/integrations/eventlink/utils"
import { sendToContentScript } from "@plasmohq/messaging"

vi.mock("@plasmohq/messaging", () => ({
  sendToContentScript: vi.fn()
}))

vi.mock("bowser", () => ({
  default: {
    parse: vi.fn(() => ({
      os: { name: "Windows" },
      browser: { name: "Chrome", version: "123.4.5" }
    }))
  }
}))

describe("getClientHeader", () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  it("returns a header with random version if fetch fails", async () => {
    vi.mocked(sendToContentScript).mockRejectedValueOnce("fail")

    const header = await getClientHeader()
    expect(header).toMatch(/^client:eventlink version:[a-f0-9]{8} platform:Windows\/chrome\/123\.4\.5$/)
  })

  it("returns a header using version extracted from remote script", async () => {
    vi.mocked(sendToContentScript).mockResolvedValueOnce("https://some-script.js")
    global.fetch = vi.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(`var SGW_VERSION: "1.2.3"`),
      } as any)
    )

    const header = await getClientHeader()
    expect(header).toMatch("version:1.2.3")
    expect(header).toMatch("Windows/chrome/123.4.5")
  })
})

describe("getAuthToken", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("returns access_token from decoded cookie", async () => {
    const token = { access_token: "abc123" }
    const encoded = btoa(JSON.stringify(token))

    vi.stubGlobal("chrome", {
      cookies: {
        get: (opts, cb) => cb({ value: encoded })
      }
    })

    const result = await getAuthToken()
    expect(result).toBe("abc123")
  })

  it("returns null if no cookie is found", async () => {
    vi.stubGlobal("chrome", {
      cookies: {
        get: (_opts, cb) => cb(undefined)
      }
    })

    const result = await getAuthToken()
    expect(result).toBeNull()
  })
})
