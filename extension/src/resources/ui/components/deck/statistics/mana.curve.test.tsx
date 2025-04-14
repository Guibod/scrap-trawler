import { render, screen, fireEvent } from "@testing-library/react"
import React from "react"
import { ManaCurveHistogram } from "./mana.curve"
import { vi, expect, beforeEach, it} from "vitest"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { CardCategory } from "~/resources/domain/utils/deck.analyzer"

vi.mock("~/resources/ui/components/deck/provider")

const mockAnalyzer = {
  manaCurve: vi.fn()
}

beforeEach(() => {
  vi.mocked(useDeck).mockReturnValue({
    analyzer: mockAnalyzer
  } as unknown as ReturnType<typeof useDeck>)
})

it("renders stacked bars and handles click", () => {
  const clickSpy = vi.fn()

  mockAnalyzer.manaCurve.mockReturnValue(new Map([
    [CardCategory.PERMANENT, [ { mv: 1, qty: 2 }, { mv: 2, qty: 3 } ]],
    [CardCategory.SPELL, [ { mv: 1, qty: 1 } ]]
  ]))

  render(<ManaCurveHistogram width={300} height={100} onStackedHistogramClick={clickSpy} />)

  const bars = screen.getAllByTestId("mana-bar")
  expect(bars).toHaveLength(4)
  fireEvent.click(bars[0])
  expect(clickSpy).toHaveBeenCalledWith("1", "permanent")
})
