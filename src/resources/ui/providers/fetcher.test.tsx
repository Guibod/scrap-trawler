import { describe, it, expect, vi, beforeEach } from "vitest"
import React from "react"
import { renderHook, act } from "@testing-library/react"
import { FetchServiceProvider, useFetch, useEventFetchStatus } from "./fetcher"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import DeckFetchService from "~/resources/integrations/decks/service"

vi.mock("@heroui/react", () => ({
  addToast: vi.fn(),
}))

describe("FetchServiceProvider", () => {
  const mockSchedule = vi.fn()
  const mockCancelAll = vi.fn()
  const mockCancelEvent = vi.fn()
  const mockGetEvent = vi.fn()
  const mockSetOnProgress = vi.fn()
  const mockSetOnEventStart = vi.fn()
  const mockSetOnEventComplete = vi.fn()

  const event = { id: "e1", title: "Mock Event" }
  const requests = [{ url: "x" }] as unknown as DeckFetchRequest[]

  const mockService = {
    schedule: mockSchedule,
    cancelAll: mockCancelAll,
    cancelEvent: mockCancelEvent,
    eventService: { get: mockGetEvent },
    setOnProgress: mockSetOnProgress,
    setOnEventStart: mockSetOnEventStart,
    setOnEventComplete: mockSetOnEventComplete,
  } as unknown as DeckFetchService

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEvent.mockResolvedValue(event)
    vi.spyOn(DeckFetchRequest, "fromEvent").mockReturnValue(requests)
    vi.spyOn(DeckFetchRequest, "fromRows").mockReturnValue(requests)
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <FetchServiceProvider service={mockService}>{children}</FetchServiceProvider>
  )

  it("should call schedule on fetchEvent", async () => {
    const { result } = renderHook(() => useFetch(), { wrapper })
    await act(() => result.current.fetchEvent("e1"))
    expect(mockSchedule).toHaveBeenCalledWith(requests)
  })

  it("should reflect status after progress", async () => {
    let onProgress: (eventId: string, processed: number, count: number) => void = () => {}
    mockSetOnProgress.mockImplementation((cb) => {
      onProgress = cb
    })

    const { result } = renderHook(() => useEventFetchStatus("e1"), { wrapper })
    act(() => {
      onProgress("e1", 2, 10)
    })

    expect(result.current.isFetching).toBe(true)
    expect(result.current.count).toBe(10)
    expect(result.current.processed).toBe(2)
  })
})
