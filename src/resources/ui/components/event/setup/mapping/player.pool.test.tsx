import { render, screen } from "@testing-library/react"
import React from "react"
import { vi, it, describe, expect } from "vitest"
import SpreadsheetPlayerPool from "~/resources/ui/components/event/setup/mapping/player.pool"
import * as provider from "~/resources/ui/components/event/setup/provider"

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ setNodeRef: vi.fn() })
}))
vi.mock("~/resources/ui/components/event/setup/mapping/player.chip", () => ({
  default: ({ player }: any) => <div>{player.firstName}</div>
}))

describe("SpreadsheetPlayerPool", () => {
  const makePlayer = (id: string, firstName: string) => ({
    id,
    firstName,
    lastName: "Test",
    archetype: "Boros",
    decklistTxt: "txt",
    decklistUrl: "url"
  })

  it("renders remaining players", () => {
    const players = [makePlayer("1", "Alice"), makePlayer("2", "Bob")]

    vi.spyOn(provider, "useEventSetup").mockReturnValue({
      status: {
        data: players,
        getWotcIdByRow: vi.fn().mockReturnValue(undefined),
      }
    } as any)

    render(<SpreadsheetPlayerPool />)

    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
  })

  it("renders success message if all paired", () => {
    vi.spyOn(provider, "useEventSetup").mockReturnValue({
      status: {
        data: [],
        getWotcIdByRow: vi.fn(),
      }
    } as any)

    render(<SpreadsheetPlayerPool />)
    expect(screen.getByText(/All players have been paired/)).toBeInTheDocument()
  })
})
