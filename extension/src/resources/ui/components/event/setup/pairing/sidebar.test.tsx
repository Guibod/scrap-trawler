import { vi, describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import PairingSidebar from "./sidebar"
import React from "react"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"

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
  default: ({ row, className }) => <div className={className}>{row.firstName} {row.lastName}</div>
}))

describe("PairingSidebar", () => {
  const unassigned = [
    { id: "r1", firstName: "Alice", lastName: "Alpha" },
    { id: "r2", firstName: "Bob", lastName: "Beta" }
  ] as SpreadsheetRow[]

  it("renders sidebar with spreadsheet players", () => {
    render(<PairingSidebar unassigned={unassigned} />)

    expect(screen.getByText("Spreadsheet Players")).toBeInTheDocument()
    expect(screen.getByText("Alice Alpha")).toBeInTheDocument()
    expect(screen.getByText("Bob Beta")).toBeInTheDocument()
  })
})