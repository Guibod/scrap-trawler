// __tests__/round-standings.test.tsx
import { render, screen } from "@testing-library/react"
import type { RoundDbo } from "~/resources/domain/dbos/round.dbo"
import { vi, it, describe, expect } from "vitest"
import React from "react"
import RoundStandings from "~/resources/ui/components/round/standings"

// Mock Team and Percentage to simplify DOM
vi.mock("~/resources/ui/components/team", () => ({
  default: ({ teamId }: any) => <div>{teamId}</div>
}))
vi.mock("~/resources/ui/components/percentage", () => ({
  default: ({ ratio }: any) => <span>{ratio}</span>
}))

describe("RoundStandings", () => {
  const round: RoundDbo = {
    id: "r1",
    roundNumber: 1,
    standings: {
      "1": { id: "3", rank: 1, matchPoints: 9, wins: 3, losses: 0, draws: 0, gameWinPercent: 0.90, opponentGameWinPercent: 0.80, opponentMatchWinPercent: 0.85 },
      "2": { id: "2", rank: 2, matchPoints: 6, wins: 2, losses: 1, draws: 0, gameWinPercent: 0.60, opponentGameWinPercent: 0.55, opponentMatchWinPercent: 0.50 },
      "10": { id: "1", rank: 10, matchPoints: 24, wins: 8, losses: 2, draws: 0, gameWinPercent: 0.75, opponentGameWinPercent: 0.60, opponentMatchWinPercent: 0.70 },
    }
  } as unknown as RoundDbo

  it("renders standings sorted by rank", () => {
    render(<RoundStandings round={round} />)

    const rankCells = screen.getAllByText(/^\d+$/).slice(0, 3) // get only rank numbers
    const ranks = rankCells.map(cell => parseInt(cell.textContent || "", 10))

    expect(ranks).toEqual([1, 3, 9]) // correct numeric sort
  })
})
