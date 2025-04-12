import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { describe, it, vi, expect } from "vitest"
import { useOAuth } from "~/resources/ui/components/oauth/provider"
import OauthStatus from "~/resources/ui/components/oauth/status"

vi.mock("~/resources/ui/components/oauth/provider", () => ({
  useOAuth: vi.fn()
}))

describe("OauthStatus", () => {
  const login = vi.fn()
  const logout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("shows spinner when connecting", () => {
    (useOAuth as any).mockReturnValue({
      connecting: true,
      connected: false,
      identity: null,
      login,
      logout
    })

    render(<OauthStatus />)
    expect(screen.getByText(/connecting to google/i)).toBeInTheDocument()
  })

  it("shows connect button when disconnected", () => {
    (useOAuth as any).mockReturnValue({
      connecting: false,
      connected: false,
      identity: null,
      login,
      logout
    })

    render(<OauthStatus />)
    const connectBtn = screen.getByRole("button", { name: /connect google/i })
    expect(connectBtn).toBeInTheDocument()

    fireEvent.click(connectBtn)
    expect(login).toHaveBeenCalled()
  })

  it("shows identity and disconnect button when connected", () => {
    (useOAuth as any).mockReturnValue({
      connecting: false,
      connected: true,
      identity: "you@example.com",
      login,
      logout
    })

    render(<OauthStatus />)

    expect(screen.getByText(/connected as you@example.com/i)).toBeInTheDocument()

    const disconnectBtn = screen.getByRole("button", { name: /disconnect/i })
    fireEvent.click(disconnectBtn)
    expect(logout).toHaveBeenCalled()
  })
})
