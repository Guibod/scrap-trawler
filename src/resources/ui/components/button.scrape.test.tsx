import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ButtonScrape } from "./button.scrape"
import { ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import { sendToBackground } from "@plasmohq/messaging"

vi.mock("@plasmohq/messaging", () => ({
  sendToBackground: vi.fn()
}))

describe("<ButtonScrape />", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing if no eventId", () => {
    const { container } = render(<ButtonScrape organizationId="org" />)
    expect(container).toBeEmptyDOMElement()
  })

  it("renders the full scrape button with correct text", async () => {
    render(<ButtonScrape eventId="e1" organizationId="o1" fake={true} />)

    const button = await screen.findByRole("button", { name: /scrape event e1/i })
    expect(button).toHaveTextContent("Scrape!")
  })

  it("renders and triggers fake scrape (non-icon)", async () => {
    vi.mocked(sendToBackground).mockImplementation(({ name }) => {
      if (name === "back/event-get") {
        return Promise.resolve({ status: { scrape: ScrapeStatus.NOT_STARTED } })
      }
      if (name === "eventlink/scrape") {
        return Promise.resolve({ status: { scrape: ScrapeStatus.COMPLETED } })
      }
    })

    render(<ButtonScrape eventId="event-123" organizationId="org-456" />)

    const button = await screen.findByRole("button", { name: /scrape event event-123/i })
    expect(button).toHaveTextContent("Scrape!")

    fireEvent.click(button)

    await waitFor(() => {
      const updated = screen.getByRole("button", { name: /scrape event event-123/i })
      expect(updated).toHaveTextContent(/scrape again/i)
    })
  })

  it("renders error icon if scrape fails", async () => {
    vi.mocked(sendToBackground).mockImplementation(({ name }) => {
      if (name === "back/event-get") {
        return Promise.resolve({ status: { scrape: ScrapeStatus.NOT_STARTED } })
      }
      if (name === "eventlink/scrape") {
        return Promise.resolve({ error: { message: "Unauthorized" } })
      }
    })

    render(<ButtonScrape eventId="e2" organizationId="o2" isIconOnly />)

    const button = await screen.findByRole("button", { name: /scrape event e2/i })
    fireEvent.click(button)

    await waitFor(() => {
      const icon = screen.getByLabelText("error-icon")
      expect(icon).toBeInTheDocument()
    })
  })
})
