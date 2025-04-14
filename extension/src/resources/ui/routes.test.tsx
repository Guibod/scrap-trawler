import { describe, it, expect, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Outlet } from "react-router-dom"
import AppRoutes from "~/resources/ui/routes"
import MtgJsonService from "~/resources/integrations/mtg-json/service"

vi.mock("~/resources/ui/pages/main", () => ({
  default: () => <div data-testid="main-page">MainPage</div>
}))

vi.mock("~/resources/ui/pages/settings", () => ({
  default: () => <div data-testid="settings-page">SettingsPage</div>
}))

vi.mock("~/resources/ui/pages/welcome", () => ({
  default: () => <div data-testid="welcome-page">WelcomePage</div>
}))

vi.mock("~/resources/ui/pages/changelog", () => ({
  default: () => <div data-testid="changelog-page">ChangelogPage</div>
}))

vi.mock("~/resources/ui/pages/event", () => ({
  default: () => <div data-testid="event-page">EventPage</div>
}))

vi.mock("~/resources/ui/components/card/status", () => ({
  default: () => <div data-testid="card-status-widget">CardStatus</div>
}))

describe("AppRoutes", () => {
  const renderWithRoute = (initialRoute: string) => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AppRoutes />
        <Outlet />
      </MemoryRouter>
    )
  }

  it("should render MainPage at '/'", () => {
    renderWithRoute("/")
    expect(screen.getByTestId("main-page")).toBeInTheDocument()
  })

  it("should render SettingsPage at '/settings'", () => {
    renderWithRoute("/settings")
    expect(screen.getByTestId("settings-page")).toBeInTheDocument()
  })

  it("should render WelcomePage at '/welcome'", () => {
    renderWithRoute("/welcome")
    expect(screen.getByTestId("welcome-page")).toBeInTheDocument()
  })

  it("should render ChangelogPage at '/changelog'", () => {
    renderWithRoute("/changelog")
    expect(screen.getByTestId("changelog-page")).toBeInTheDocument()
  })

  it("should render EventPage at '/event/:eventId'", () => {
    renderWithRoute("/event/123")
    expect(screen.getByTestId("event-page")).toBeInTheDocument()
  })

  it("should redirect unknown routes to '/'", () => {
    renderWithRoute("/unknown")
    expect(screen.getByTestId("main-page")).toBeInTheDocument()
  })
})
