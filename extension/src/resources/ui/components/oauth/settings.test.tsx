import { vi, describe, it, expect } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import GoogleIntegrationSettings from "~/resources/ui/components/oauth/settings"

// Mock the child component
vi.mock("~/resources/ui/components/oauth/status", () => ({
  default: () => <div data-testid="OauthStatus" />
}))

describe("GoogleIntegrationSettings", () => {
  it("renders title, description, and OauthStatus", () => {
    render(<GoogleIntegrationSettings />)

    expect(screen.getByText("Google Integration")).toBeInTheDocument()
    expect(screen.getByText(/fetch spreadsheets securely/i)).toBeInTheDocument()
    expect(screen.getByTestId("OauthStatus")).toBeInTheDocument()
  })

  it("applies custom className if provided", () => {
    const { container } = render(<GoogleIntegrationSettings className="custom-class" />)
    expect(container.firstChild).toHaveClass("custom-class")
  })
})
