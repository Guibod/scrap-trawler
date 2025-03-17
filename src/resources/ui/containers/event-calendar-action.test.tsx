import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { render, screen } from "@testing-library/react"
import EventCalendarAction from "~/resources/ui/containers/event-calendar-action"
import Context from "~/resources/integrations/eventlink/context"

// Mock Context
vi.mock("~/resources/integrations/eventlink/context", () => ({
  default: {
    getOrganizationId: vi.fn(),
  }
}))

// Mock ButtonScrape Component
vi.mock("~/resources/ui/components/button.scrape", () => ({
  default: ({ eventId, organizationId }: { eventId: string, organizationId: string }) =>
    <button data-testid="button-scrape">{`Scrape ${eventId} ${organizationId}`}</button>
}))

describe("EventCalendarAction", () => {
  let mockAnchor: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock for getOrganizationId
    vi.mocked(Context.getOrganizationId).mockReturnValue("org-456")

    // Mock anchor element structure
    mockAnchor = {
      element: document.createElement("div"),
    }
  })

  it("does not render if .capacity-details is missing", () => {
    render(<EventCalendarAction anchor={mockAnchor} />)

    expect(screen.queryByTestId("button-scrape")).not.toBeInTheDocument()
  })

  it("does not render if .capacity-details has no id", () => {
    const capacityDetails = document.createElement("div")
    capacityDetails.className = "capacity-details"
    mockAnchor.element.appendChild(capacityDetails)

    render(<EventCalendarAction anchor={mockAnchor} />)

    expect(screen.queryByTestId("button-scrape")).not.toBeInTheDocument()
  })

  it("renders ButtonScrape with the correct eventId and organizationId", () => {
    const capacityDetails = document.createElement("div")
    capacityDetails.className = "capacity-details"
    capacityDetails.setAttribute("id", "event-123")
    mockAnchor.element.appendChild(capacityDetails)

    render(<EventCalendarAction anchor={mockAnchor} />)

    expect(screen.getByTestId("button-scrape")).toHaveTextContent("Scrape event-123 org-456")
  })

  it("gracefully handles errors and does not render anything", () => {
    vi.spyOn(mockAnchor.element, "querySelector").mockImplementation(() => {
      throw new Error("Test Error")
    })

    render(<EventCalendarAction anchor={mockAnchor} />)

    expect(screen.queryByTestId("button-scrape")).not.toBeInTheDocument()
  })
})
