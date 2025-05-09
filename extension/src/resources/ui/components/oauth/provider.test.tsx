import { describe, it, beforeEach, vi, expect } from "vitest"
import React from "react"
import { renderHook, act } from "@testing-library/react"
import { OAuthProvider, useOAuth } from "~/resources/ui/components/oauth/provider"
import { OAuthService } from "~/resources/integrations/google-oauth/oauth.service"
import { createMock } from "@golevelup/ts-vitest"

describe("OAuthProvider", () => {
  const mockToken = "mock-token"
  const mockEmail = "user@example.com"

  const mockService = createMock<OAuthService>()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <OAuthProvider oauthService={mockService}>{children}</OAuthProvider>
  )

  it("provides default disconnected state", () => {
    const { result } = renderHook(() => useOAuth(), { wrapper })
    expect(result.current.connected).toBe(false)
    expect(result.current.connecting).toBe(false)
    expect(result.current.identity).toBe(null)
    expect(result.current.token).toBe(null)
  })

  it("logs in and sets token and identity", async () => {
    mockService.getGoogleApiToken.mockResolvedValue(mockToken)
    mockService.getUserInfo.mockResolvedValue({ email: mockEmail })

    const { result } = renderHook(() => useOAuth(), { wrapper })

    await act(async () => {
      await result.current.login()
    })

    expect(result.current.connected).toBe(true)
    expect(result.current.connecting).toBe(false)
    expect(result.current.identity).toBe(mockEmail)
    expect(result.current.token).toBe(mockToken)
  })

  it("logs out and clears state", async () => {
    mockService.getGoogleApiToken.mockResolvedValue(mockToken)
    mockService.getUserInfo.mockResolvedValue({ email: mockEmail })

    const { result } = renderHook(() => useOAuth(), { wrapper })

    await act(async () => {
      await result.current.login()
    })

    await act(async () => {
      await result.current.logout()
    })

    expect(mockService.clearCachedToken).toHaveBeenCalled()
    expect(result.current.connected).toBe(false)
    expect(result.current.identity).toBe(null)
    expect(result.current.token).toBe(null)
  })

  it("calls checkConnection on mount and sets connected state", async () => {
    mockService.getGoogleApiToken.mockResolvedValue(mockToken)
    mockService.getUserInfo.mockResolvedValue({ email: mockEmail })

    const { result } = renderHook(() => useOAuth(), { wrapper })

    // Wait for effect to run
    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.connected).toBe(true)
    expect(result.current.identity).toBe(mockEmail)
    expect(result.current.token).toBe(mockToken)
  })

  it("handles error during checkConnection", async () => {
    mockService.getGoogleApiToken.mockRejectedValue(new Error("No token"))

    const { result } = renderHook(() => useOAuth(), { wrapper })

    await act(async () => {
      await Promise.resolve()
    })

    expect(result.current.connected).toBe(false)
    expect(result.current.identity).toBe(null)
    expect(result.current.token).toBe(null)
  })
})
