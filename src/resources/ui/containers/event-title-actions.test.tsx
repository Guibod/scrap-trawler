import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import EventTitleActions from "~/resources/ui/containers/event-title-actions"
import Context from "~/resources/integrations/eventlink/context"

// Mock Context
vi.mock("~/resources/integrations/eventlink/context", () => ({
  default: {
    getEventId: vi.fn(),
    getOrganizationId: vi.fn(),
  }
}))

// Mock Button Components
vi.mock("~/resources/ui/components/button.open", () => ({
  default: () => <button data-testid="button-open">Open</button>
}))

vi.mock("~/resources/ui/components/button.scrape", () => ({
  default: ({ eventId, organizationId }: { eventId: string, organizationId: string }) =>
    <button data-testid="button-scrape">{`Scrape ${eventId} ${organizationId}`}</button>
}))

describe("EventTitleActions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("does not render buttons if eventId or organizationId is missing", async () => {
    vi.mocked(Context.getEventId).mockReturnValue(null)
    vi.mocked(Context.getOrganizationId).mockReturnValue("org-456")

    render(<EventTitleActions />)

    expect(screen.queryByTestId("button-scrape")).not.toBeInTheDocument()
    expect(screen.queryByTestId("button-open")).not.toBeInTheDocument()
  })

  it("renders ButtonScrape and ButtonOpen when eventId and organizationId are present", async () => {
    vi.mocked(Context.getEventId).mockReturnValue("event-123")
    vi.mocked(Context.getOrganizationId).mockReturnValue("org-456")

    render(<EventTitleActions />)

    await waitFor(() => {
      expect(screen.getByTestId("button-scrape")).toBeInTheDocument()
      expect(screen.getByTestId("button-scrape")).toHaveTextContent("Scrape event-123 org-456")
      expect(screen.getByTestId("button-open")).toBeInTheDocument()
    })
  })
})
