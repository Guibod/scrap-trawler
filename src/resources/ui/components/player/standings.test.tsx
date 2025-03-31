import React from "react"
import { render, screen, within } from "@testing-library/react"
import PlayerStandings from "./standings"
import { vi, expect, describe } from "vitest"

vi.mock("~/resources/ui/providers/event", () => ({
  usePlayer: vi.fn(() => ({
    standings: {
      "1": {
        id: "r1",
        rank: 5,
        matchPoints: 9,
        wins: 3,
        losses: 0,
        draws: 0,
        gameWinPercent: 0.75,
        opponentGameWinPercent: 0.60,
        opponentMatchWinPercent: 0.66,
      },
      "2": {
        id: "r2",
        rank: 3,
        matchPoints: 12,
        wins: 4,
        losses: 0,
        draws: 0,
        gameWinPercent: 0.80,
        opponentGameWinPercent: 0.70,
        opponentMatchWinPercent: 0.72,
      },
    },
  })),
}))

describe("<PlayerStandings />", () => {
  it("renders standings with correct values", () => {
    render(<PlayerStandings playerId="p1" />)

    const rows = screen.getAllByRole("row")
    expect(rows).toHaveLength(3) // Header + 2 data rows

    const [_, row1, row2] = rows

    const withinRow1 = within(row1)
    expect(withinRow1.getByText("1")).toBeInTheDocument()
    expect(withinRow1.getByText("5")).toBeInTheDocument()
    expect(withinRow1.getByText("9")).toBeInTheDocument()
    expect(withinRow1.getByText("3 - 0 - 0")).toBeInTheDocument()
    expect(withinRow1.getAllByText((_, el) =>
      el?.textContent?.replace(/\s/g, "") === "75.00%"
    )[0]).toBeInTheDocument()
    expect(withinRow1.getAllByText((_, el) =>
      el?.textContent?.replace(/\s/g, "") === "60.00%"
    )[0]).toBeInTheDocument()
    expect(withinRow1.getAllByText((_, el) =>
      el?.textContent?.replace(/\s/g, "") === "66.00%"
    )[0]).toBeInTheDocument()

    const withinRow2 = within(row2)
    expect(withinRow2.getByText("2")).toBeInTheDocument()
    expect(withinRow2.getByText("3")).toBeInTheDocument()
    expect(withinRow2.getByText("12")).toBeInTheDocument()
    expect(withinRow2.getByText("4 - 0 - 0")).toBeInTheDocument()
    expect(withinRow2.getAllByText((_, el) =>
      el?.textContent?.replace(/\s/g, "") === "80.00%"
    )[0]).toBeInTheDocument()
    expect(withinRow2.getAllByText((_, el) =>
      el?.textContent?.replace(/\s/g, "") === "70.00%"
    )[0]).toBeInTheDocument()
    expect(withinRow2.getAllByText((_, el) =>
      el?.textContent?.replace(/\s/g, "") === "72.00%"
    )[0]).toBeInTheDocument()
  })
})
