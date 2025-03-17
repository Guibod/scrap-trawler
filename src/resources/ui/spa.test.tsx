import { describe, it, expect, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import Spa from "~/resources/ui/spa"

// Mock Providers
vi.mock("~/resources/ui/providers", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>
}))

// Mock AppRoutes
vi.mock("~/resources/ui/routes", () => ({
  default: () => <div data-testid="app-routes">AppRoutes</div>
}))

describe("Spa Component", () => {
  it("renders Providers and AppRoutes correctly", () => {
    render(<Spa />)

    expect(screen.getByTestId("providers")).toBeInTheDocument()
    expect(screen.getByTestId("app-routes")).toBeInTheDocument()
  })
})
