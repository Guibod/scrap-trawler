import React from "react"
import { render, screen, fireEvent, within } from "@testing-library/react"
import EventDeckStatistics from "./statistics"
import { vi, expect, beforeEach } from "vitest"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { GroupBy } from "~/resources/domain/utils/deck.analyzer"

vi.mock("~/resources/ui/components/deck/provider")

vi.mock("~/resources/ui/components/deck/statistics/mana.curve", () => ({
  ManaCurveHistogram: ({ onClick }: any) => (
    <div data-testid="mocked-mana-curve">
      <button onClick={() => onClick?.("3")}>Mana Value</button>
    </div>
  ),
}))

vi.mock("~/resources/ui/components/deck/statistics/mana.breakdown", () => ({
  ManaColorBreakdown: () => <div data-testid="mocked-mana-breakdown" />,
}))

vi.mock("~/application/deck/use-deck-analyzer", () => ({
  useDeckAnalyzer: () => mockAnalyzer,
}))

const mockAnalyzer = {
  analyzeMana: vi.fn(),
  groupBy: vi.fn(),
  manaCurve: vi.fn(),
  count: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useDeck).mockReturnValue({
    analyzer: mockAnalyzer
  } as unknown as ReturnType<typeof useDeck>)

  mockAnalyzer.analyzeMana.mockReturnValue({
    avgWithLands: 3.2,
    avgNoLands: 2.8,
    medianWithLands: 3,
    medianNoLands: 2,
    totalMV: 180,
    totalCount: 60,
    totalPips: 90,
    pips: new Map(),
    production: new Map()
  })

  mockAnalyzer.groupBy.mockReturnValue(new Map([
    ["Creature", [{ quantity: 2, card: { name: "Llanowar Elves" } }]]
  ]))
})

it("renders mana statistics summary", () => {
  render(<EventDeckStatistics onHoveredCard={vi.fn()} />)

  expect(screen.getByText(/average mana value/i)).toHaveTextContent("3.2")
  expect(screen.getByText(/median mana value/i)).toHaveTextContent("3")
  expect(screen.getByText(/total mana value/i)).toHaveTextContent("180")
})

it("renders histogram and breakdown blocks", () => {
  render(<EventDeckStatistics onHoveredCard={vi.fn()} />)

  expect(screen.getAllByText("Mana Value")[0]).toBeInTheDocument()
  expect(screen.getAllByText("Mana Breakdown")[0]).toBeInTheDocument()
})

it("renders mana curve histogram", () => {
  render(<EventDeckStatistics onHoveredCard={vi.fn()} />)

  expect(screen.getByTestId("mocked-mana-curve")).toBeInTheDocument()
})

it("renders mana breakdown", () => {
  render(<EventDeckStatistics onHoveredCard={vi.fn()} />)

  expect(screen.getByTestId("mocked-mana-breakdown")).toBeInTheDocument()
})

