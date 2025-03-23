import { describe, it, expect, vi, beforeEach } from "vitest"
import worker from "../src"

const mockEnv = {
  MOXFIELD_SECRET: "TEST_SECRET"
}

const createRequest = (url: string, origin?: string): Request =>
  new Request(url, {
    method: "GET",
    headers: origin ? { origin } : {}
  })

describe("Cloudflare Worker /moxfield/:id", () => {
  const validOrigin = "chrome-extension://bibaandedejifgojmndgbpoicofbopea"
  const devOrigin = "chrome-extension://ppkmodalnfeenflonpdocilbbolmffpb"
  const invalidOrigin = "https://not-allowed.com"

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      text: () => Promise.resolve("{ \"mocked\": true }"),
      headers: new Headers({ "Content-Type": "application/json" })
    })
  })

  it("returns 404 for unmatched routes", async () => {
    const req = createRequest("https://example.com/invalid-route", validOrigin)
    const res = await worker.fetch(req, mockEnv)
    expect(res.status).toBe(404)
  })

  it("returns 403 if origin is missing or invalid", async () => {
    const noOriginRes = await worker.fetch(createRequest("https://example.com/moxfield/abc123"), mockEnv)
    expect(noOriginRes.status).toBe(403)

    const invalidRes = await worker.fetch(createRequest("https://example.com/moxfield/abc123", invalidOrigin), mockEnv)
    expect(invalidRes.status).toBe(403)
  })

  it("proxies request and injects secret for valid origin", async () => {
    const res = await worker.fetch(
      createRequest("https://example.com/moxfield/deck123", validOrigin),
      mockEnv
    )

    expect(res.status).toBe(200)
    expect(fetch).toHaveBeenCalledWith(
      "https://api2.moxfield.com/v3/decks/all/deck123",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "application/json",
          "User-Agent": "MoxKey; TEST_SECRET"
        })
      })
    )

    const body = await res.text()
    expect(body).toContain("mocked")
  })

  it("accepts dev origin", async () => {
    const res = await worker.fetch(
      createRequest("https://example.com/moxfield/devdeck", devOrigin),
      mockEnv
    )
    expect(res.status).toBe(200)
  })
})
