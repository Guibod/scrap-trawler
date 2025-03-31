import { render, screen } from "@testing-library/react"
import React from "react"
import { ManaColorBreakdown } from "./mana.breakdown"
import { vi, expect, beforeEach } from "vitest"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { GroupBy } from "~/resources/domain/utils/deck.analyzer"

vi.mock("~/resources/ui/components/deck/provider")

const fakeAnalyzer = {
  manaCurve: vi.fn(),
  analyzeMana: vi.fn(),
  count: vi.fn(),
}

beforeEach(() => {
  vi.mocked(useDeck).mockReturnValue({
    analyzer: fakeAnalyzer
  } as unknown as ReturnType<typeof useDeck>)

  fakeAnalyzer.count.mockImplementation(({ colors, excludeTypes, types }) => {
    if (types?.includes("Land")) return 10
    if (excludeTypes?.includes("Land")) return colors ? 2 : 10
    return 0
  })

  fakeAnalyzer.analyzeMana.mockReturnValue({
    totalPips: 10,
    pips: new Map([
      [MTG_COLORS.RED, 3],
      [MTG_COLORS.BLUE, 2],
    ]),
    production: new Map([
      [MTG_COLORS.RED, 5],
      [MTG_COLORS.BLUE, 1],
    ]),
  })

  fakeAnalyzer.manaCurve.mockImplementation(({ grouping }) => {
    if (grouping === GroupBy.COLOR) {
      return new Map([
        [MTG_COLORS.RED, [{ mv: 2, qty: 3 }]],
        [MTG_COLORS.BLUE, [{ mv: 1, qty: 2 }]],
      ])
    }
    return new Map()
  })
})

it("renders color breakdown for all 6 colors", () => {
  render(<ManaColorBreakdown />)

  expect(screen.getByText(/white/i, { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/blue/i, { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/black/i, { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/red/i, { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/green/i, { exact: false })).toBeInTheDocument()
  expect(screen.getByText(/colorless/i, { exact: false })).toBeInTheDocument()

  expect(screen.getAllByText(/of all symbols/i)).toHaveLength(6)

  expect(screen.getByLabelText("R mana bar")).toBeInTheDocument()
  expect(screen.getByLabelText("U mana bar")).toBeInTheDocument()
})
