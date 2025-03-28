import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import TableEvents from "~/resources/ui/components/table.events"
import type { EventSummarizedDbo } from "~/resources/domain/dbos/event.summarized.dbo"
import { MemoryRouter } from "react-router-dom"
import { createMock } from "@golevelup/ts-vitest"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { EventScrapeStateDbo } from "~/resources/domain/enums/event.scrape.state.dbo"
import type EventService from "~/resources/domain/services/event.service"
import React from "react"

const mockEvent: EventSummarizedDbo = {
  id: "evt-123",
  title: "Cool Event",
  date: new Date("2025-03-01"),
  lastUpdated: new Date("2025-03-02"),
  organizer: "Guibod",
  format: MTG_FORMATS.COMMANDER,
  players: 42,
  capacity: 64,
  scrapeStatus: EventScrapeStateDbo.COMPLETE,
  status: {
    global: GlobalStatus.PARTIAL,
    scrape: ScrapeStatus.COMPLETED,
    pair: PairStatus.NOT_STARTED,
    fetch: FetchStatus.NOT_STARTED,
  },
}

describe("TableEvents component", () => {
  let listEvents = vi.fn()

  beforeEach(() => {
    listEvents = vi.fn()
  })

  it("shows empty state if no events exist", async () => {
    listEvents.mockResolvedValue([])

    const service = createMock<EventService>({ listEvents })

    render(
      <MemoryRouter>
        <TableEvents eventService={service} />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/no events yet/i)).toBeInTheDocument()
    })
  })

  it("renders a single event", async () => {
    listEvents.mockResolvedValue([mockEvent])

    const service = createMock<EventService>({ listEvents })

    render(
      <MemoryRouter>
        <TableEvents eventService={service} />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/cool event/i)).toBeInTheDocument()
      expect(screen.getByText("Guibod")).toBeInTheDocument()
      expect(screen.getByText("commander")).toBeInTheDocument()
    })
  })

  it("shows loading state briefly", async () => {
    let resolve!: (val: EventSummarizedDbo[]) => void
    const promise = new Promise<EventSummarizedDbo[]>((res) => {
      resolve = res
    })

    listEvents.mockReturnValue(promise)

    const service = createMock<EventService>({ listEvents })

    render(
      <MemoryRouter>
        <TableEvents eventService={service} />
      </MemoryRouter>
    )

    // No assertion — this would be where you'd check a loading spinner
    resolve([mockEvent])
    await waitFor(() => screen.getByText(/cool event/i))
  })
})
