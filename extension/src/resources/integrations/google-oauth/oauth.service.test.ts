import { describe, it, beforeEach, vi, expect } from "vitest"
import { OAuthService } from "~/resources/integrations/google-oauth/oauth.service"

// Mock logger
vi.mock("~/resources/logging/logger", () => ({
  getLogger: () => ({
    debug: vi.fn(),
    error: vi.fn()
  })
}))

function mockAuthToken(fn: (details: chrome.identity.TokenDetails, cb: (token?: string) => void) => void) {
  vi.mocked(chrome.identity.getAuthToken as unknown as typeof fn).mockImplementation(fn)
}

describe("OauthService", () => {
  const TOKEN = "fake-token"
  let service: OAuthService

  beforeEach(() => {
    vi.useFakeTimers()
    service = OAuthService.getInstance()
    service.clearCachedToken()
    vi.resetAllMocks()
    chrome.runtime.lastError = null
  })

  it("fetches and caches token", async () => {
    mockAuthToken((_details, cb) => cb(TOKEN))

    const token = await service.getGoogleApiToken()
    expect(token).toBe(TOKEN)

    // Should reuse cached token
    const second = await service.getGoogleApiToken()
    expect(second).toBe(TOKEN)

    expect(chrome.identity.getAuthToken).toHaveBeenCalledTimes(1)
  })

  it("refreshes token after expiration", async () => {
    mockAuthToken((_details, cb) => cb(TOKEN))

    await service.getGoogleApiToken()
    vi.advanceTimersByTime(60 * 60 * 1000 + 1) // 1 hour + 1ms

    await service.getGoogleApiToken()
    expect(chrome.identity.getAuthToken).toHaveBeenCalledTimes(2)
  })

  it("clears cache", async () => {
    mockAuthToken((_details, cb) => cb(TOKEN))

    await service.getGoogleApiToken()
    await service.clearCachedToken()

    await service.getGoogleApiToken()
    expect(chrome.identity.getAuthToken).toHaveBeenCalledTimes(2)
  })

  it("throws when no token is returned", async () => {
    mockAuthToken((_details, cb) => cb(undefined))

    await expect(service.getGoogleApiToken()).rejects.toMatch("No token returned")
  })

  it("throws on chrome.runtime.lastError", async () => {
    chrome.runtime.lastError = { message: "something went wrong" }
    mockAuthToken((_details, cb) => cb(undefined))

    await expect(service.getGoogleApiToken()).rejects.toMatch("something went wrong")
  })
})
