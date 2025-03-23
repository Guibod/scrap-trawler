import { render, screen, fireEvent } from "@testing-library/react"
import { vi, beforeEach, it, expect } from "vitest"
import * as fetcher from "~/resources/ui/providers/fetcher"
import * as eventProvider from "~/resources/ui/providers/event"
import React from "react"
import FetchStatus from "~/resources/ui/components/fetch/status"

describe("FetchStatus", () => {
  const mockFetchEvent = vi.fn()

  beforeEach(() => {
    vi.spyOn(eventProvider, "useEvent").mockReturnValue({ event: { id: "abc", mapping: true } })
    vi.spyOn(fetcher, "useFetchService").mockReturnValue({ fetchEvent: mockFetchEvent } as any)
  })

  it("shows loading progress when fetching", () => {
    vi.spyOn(fetcher, "useEventFetchStatus").mockReturnValue({
      isFetching: true,
      hasFailure: false,
      hasError: false,
      count: 10,
      processed: 5,
    })

    render(<FetchStatus />)
    expect(screen.getByLabelText("fetch-status-progress")).toBeInTheDocument()
    expect(screen.getByText("Fetching decks...")).toBeInTheDocument()
  })

  it("shows fetch button when not fetching and mapping exists", () => {
    vi.spyOn(fetcher, "useEventFetchStatus").mockReturnValue({
      isFetching: false,
      hasFailure: false,
      hasError: false,
      count: 0,
      processed: 0,
    })

    render(<FetchStatus />)
    const button = screen.getByRole("button", { name: "Fetch Decks" })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(mockFetchEvent).toHaveBeenCalledWith("abc")
  })
})
