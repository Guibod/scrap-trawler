import { describe, it, expect, beforeEach, vi } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import EventContainer from "~/resources/ui/components/event/container"
import { useEvent } from "~/resources/ui/providers/event"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import userEvent from "@testing-library/user-event"

// Mock `useEvent` to provide test data
vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: vi.fn()
}))

// Mock Components
vi.mock("~/resources/ui/components/event/view", () => ({
  default: vi.fn(() => <div data-testid="event-view">EventView</div>)
}))

vi.mock("~/resources/ui/components/event/setup", () => ({
  default: vi.fn(() => <div data-testid="event-setup">EventSetup</div>)
}))

vi.mock("~/resources/ui/components/event/empty", () => ({
  default: vi.fn(() => <div data-testid="event-empty">EventEmpty</div>)
}))

describe("EventContainer", () => {
  const mockEvent = {
    title: "Magic Tournament",
    date: new Date("2024-03-17"),
    scrapeStatus: EventScrapeStateDbo.COMPLETE
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useEvent).mockReturnValue({
      event: mockEvent,
      showSetupByDefault: false
    } as unknown as ReturnType<typeof useEvent>)
  })

  it("renders event title and date", () => {
    render(<EventContainer />)

    expect(screen.getByText("Magic Tournament")).toBeInTheDocument()
    expect(screen.getByText("3/17/2024")).toBeInTheDocument() // Ensure correct locale format
  })

  it("displays EventView by default", () => {
    render(<EventContainer />)
    expect(screen.getByTestId("event-view")).toBeInTheDocument()
  })

  it("switching toggles between EventView and EventSetup", async () => {
    render(<EventContainer />)

    // Ensure EventView is shown by default
    expect(screen.getByTestId("event-view")).toBeInTheDocument()

    // Click the toggle switch
    const switchButton = screen.getByRole("switch")
    await userEvent.click(switchButton)

    // Ensure EventSetup is now displayed
    expect(screen.getByTestId("event-setup")).toBeInTheDocument()

    // Click again to switch back
    await userEvent.click(switchButton)
    expect(screen.getByTestId("event-view")).toBeInTheDocument()
  })

  it("shows EventEmpty if event is purged", () => {
    vi.mocked(useEvent).mockReturnValue({
      event: { ...mockEvent, scrapeStatus: EventScrapeStateDbo.PURGED },
      showSetupByDefault: false
    } as unknown as ReturnType<typeof useEvent>)

    render(<EventContainer />)

    expect(screen.getByTestId("event-empty")).toBeInTheDocument()
  })
})
