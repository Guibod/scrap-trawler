import { vi, describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import PairingMain from "./main"
import type { PairingPlayer } from "~/resources/ui/components/event/setup/pairing/types"
import React from "react"

vi.mock("~/resources/ui/components/player/player", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock("~/resources/ui/components/dnd/droppable", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock("~/resources/ui/components/dnd/draggable", () => ({
  __esModule: true,
  Draggable: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock("~/resources/ui/components/event/setup/mapping/player.chip", () => ({
  __esModule: true,
  default: ({ row }) => <div>{row.firstName} {row.lastName}</div>
}))

describe("PairingMain", () => {
  const players = [
    { id: "p1", firstName: "Alice", lastName: "Alpha", row: { id: "r1", firstName: "Alice", lastName: "Alpha" } },
    { id: "p2", firstName: "Bob", lastName: "Beta" } // No row, no chip
  ] as PairingPlayer[]

  it("renders EventLink players with chips if matched", () => {
    render(<PairingMain players={players} localMapping={{}} />)

    expect(screen.getByText("EventLink Players")).toBeInTheDocument()
    expect(screen.getByText("Alice Alpha")).toBeInTheDocument()
    expect(screen.queryByText("Bob Beta")).not.toBeInTheDocument()
  })
})