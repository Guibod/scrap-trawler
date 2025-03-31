import { act, fireEvent, render, screen } from "@testing-library/react"
import React from "react"
import { useEvent } from "~/resources/ui/providers/event"
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom"
import { FetchStatus, GlobalStatus, PairStatus, ScrapeStatus } from "~/resources/domain/enums/status.dbo"
import { beforeEach, expect, it, vi } from "vitest"
import EventLayout from "~/resources/ui/components/event/layout"
import type { EventModel } from "~/resources/domain/models/event.model"

vi.mock("~/resources/ui/providers/event")

vi.mock("~/resources/ui/components/status/fetch", () => ({
  default: () => <div data-testid="fetch-status" />
}))

vi.mock("~/resources/ui/components/button.scrape", () => ({
  default: () => <button>Scrape</button>
}))

const mockNavigate = vi.fn()

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})


const fakeEvent = {
  id: "event-1",
  title: "GP Paris",
  date: new Date("2024-04-06T00:00:00Z"),
  organizer: { id: "org-123" },
  status: { scrape: ScrapeStatus.COMPLETED_ENDED }
}

beforeEach(() => {
  vi.mocked(useEvent).mockReturnValue({
    event: fakeEvent as EventModel
  } as unknown as ReturnType<typeof useEvent>)
})

it("renders event title and date", () => {
  render(
    <MemoryRouter initialEntries={[`/event/${fakeEvent.id}`]}>
      <Routes>
        <Route path="/event/:id" element={<EventLayout />} />
      </Routes>
    </MemoryRouter>
  )

  expect(screen.getByText("GP Paris")).toBeInTheDocument()
  expect(screen.getByText("4/6/2024")).toBeInTheDocument()
  expect(screen.getByRole("switch")).toBeInTheDocument()
  expect(screen.getByRole("button", { name: /scrape/i })).toBeInTheDocument()
})

it("hides ButtonScrape when event is COMPLETED_LIVE", () => {
  vi.mocked(useEvent).mockReturnValue({
    event: {
      ...fakeEvent,
      status: {
        scrape: ScrapeStatus.COMPLETED_LIVE,
        fetch: FetchStatus.COMPLETED,
        pair: PairStatus.COMPLETED,
        global: GlobalStatus.COMPLETED
      }
    } as EventModel
  } as unknown as ReturnType<typeof useEvent>)

  render(
    <MemoryRouter initialEntries={[`/event/${fakeEvent.id}`]}>
      <Routes>
        <Route path="/event/:id" element={<EventLayout />} />
      </Routes>
    </MemoryRouter>
  )

  expect(screen.queryByRole("button", { name: /scrape/i })).not.toBeInTheDocument()
})

it("toggles setup/view mode via switch", () => {
  render(
    <MemoryRouter initialEntries={["/event/event-1/setup"]}>
      <Routes>
        <Route path="/event/:id/*" element={<EventLayout />} />
      </Routes>
    </MemoryRouter>
  )

  const switchEl = screen.getByRole("switch")
  act(() => {
    fireEvent.click(switchEl)
  })

  expect(mockNavigate).toHaveBeenCalledWith("view")
})
