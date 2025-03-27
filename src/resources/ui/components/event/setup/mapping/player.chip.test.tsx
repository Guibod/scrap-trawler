import { render, screen } from "@testing-library/react"
import React from "react"
import { describe, it, expect } from "vitest"
import PlayerChip from "~/resources/ui/components/event/setup/mapping/player.chip"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"

describe("PlayerChip", () => {
  const baseRow = { id: "1", firstName: "Jane", lastName: "Doe" } as SpreadsheetRow

  it("renders player name correctly", () => {
    render(<PlayerChip row={baseRow} />)
    expect(screen.getByText("Jane Doe")).toBeInTheDocument()
  })

  it("shows manual icon and blue background", () => {
    render(<PlayerChip row={baseRow} mode="manual" />)
    const chip = screen.getByLabelText("chip for Jane Doe")
    expect(chip).toHaveClass("bg-blue-500")
  })

  it("shows random icon and red background", () => {
    render(<PlayerChip row={baseRow} mode="random" />)
    const chip = screen.getByLabelText("chip for Jane Doe")
    expect(chip).toHaveClass("bg-red-500")
  })

  it("has no icon and gray background when unpaired", () => {
    render(<PlayerChip row={baseRow} />)
    const chip = screen.getByLabelText("chip for Jane Doe")
    expect(chip).toHaveClass("bg-gray-300")
  })
})