import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { usePairingController } from "~/resources/ui/components/event/setup/pairing/usePairing.controller"
import EventBuilder from "~/resources/domain/builders/event.builder"
import type { SetupStatus } from "~/resources/ui/components/event/setup/status"
import type { EventModel } from "~/resources/domain/models/event.model"
import type { MappingDbo } from "~/resources/domain/dbos/mapping.dbo"

describe("usePairingController", () => {
  let mockEvent: EventModel
  let mockStatus: SetupStatus
  let handlePairings: (updatedPairings: MappingDbo | null) => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockEvent = EventBuilder.anEvent
      .player()
      .partial({id: "a", firstName: "Alice", lastName: "Alpha"})
      .end()
      .player()
      .partial({ id: "b", firstName: "Bob", lastName: "Beta" })
      .end()
      .player()
      .partial({ id: "c", firstName: "Gerard", lastName: "Gamma" })
      .end()
      .player()
      .partial({ id: "d", firstName: "Dan", lastName: "Delta" })
      .end()
      .player()
      .partial({ id: "e", firstName: "Ed", lastName: "Epsilon" })
      .end()
      .player()
      .partial({ id: "f", firstName: "Phil", lastName: "Phi" })
      .end()
      .player()
      .partial({ id: "h", firstName: "Zoe", lastName: "Zeta" })
      .end()
      .player()
      .partial({ id: "h", firstName: "Omer", lastName: "Omega" })
      .end()
      .build()

    mockStatus = {
      data: mockEvent.spreadsheet.data,
      pairs: {},
      getWotcIdByRow: vi.fn(),
      hasAllPairings: false
    } as unknown as SetupStatus

    handlePairings = vi.fn()
  })

  it("initializes with unassigned rows", () => {
    mockEvent.mapping = {}

    const { result } = renderHook(() => usePairingController(mockEvent, mockStatus, handlePairings))
    expect(result.current.unassigned).toEqual(mockEvent.spreadsheet.data)
    expect(result.current.localMapping).toEqual({})
  })

  it("sorts players by name and pairing status", () => {
    const { result } = renderHook(() => usePairingController(mockEvent, mockStatus, handlePairings))
    const sorted = result.current.getSortedPlayers()
    expect(sorted[0].lastName).toBe("Alpha")
    expect(sorted[1].lastName).toBe("Beta")
  })

  it("handles drag end to assign player", () => {
    const { result } = renderHook(() => usePairingController(mockEvent, mockStatus, handlePairings))

    act(() => {
      result.current.handleDragEnd({
        active: { id: "r1" },
        over: { id: "a" }
      })
    })

    expect(handlePairings).toHaveBeenCalled()
    expect(result.current.localMapping).toHaveProperty("a")
    expect(result.current.localMapping["a"]).toEqual({ rowId: "r1", mode: "manual" })
  })
})