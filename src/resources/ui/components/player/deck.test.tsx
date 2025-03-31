import { vi, describe, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import PlayerDeck from "~/resources/ui/components/player/deck"
import React from "react"

// Mocks for providers
vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: () => ({ event: { id: 1 } }),
  usePlayer: () => ({
    spreadsheetRowId: 1,
    archetype: "Simic Mutate",
    decklistUrl: "https://moxfield.com/deck/123",
    decklistTxt: "",
    firstName: "G",
    lastName: "B"
  }),
}))
vi.mock("~/resources/ui/providers/fetcher", () => ({
  useFetchService: () => ({
    fetchDeckRows: vi.fn(),
  }),
  useEventFetchStatus: () => ({ isFetching: false }),
}))
vi.mock("~/resources/ui/components/deck/provider", () => ({
  useDeck: () => ({
    deck: { id: "deck1" },
    hoveredCard: { imageMedium: "https://example.com/card.jpg" },
    onHoveredCard: vi.fn(),
  }),
}))

// Mocked components
vi.mock("~/resources/ui/components/deck/legality", () => ({
  default: () => <span data-testid="mocked-legality" />,
}))
vi.mock("~/resources/ui/components/deck/last.update", () => ({
  default: () => <span data-testid="mocked-last-update" />,
}))
vi.mock("~/resources/ui/components/deck/source", () => ({
  DeckSourceBadge: () => <span data-testid="mocked-source-badge" />,
}))
vi.mock("~/resources/ui/components/deck/decklist", () => ({
  default: ({ onHoveredCard }: any) => (
    <div data-testid="mocked-decklist" onMouseOver={() => onHoveredCard?.({ imageMedium: "hovered.jpg" })}>
      MockDeckList
    </div>
  ),
}))
vi.mock("~/resources/ui/components/deck/statistics", () => ({
  default: () => <div data-testid="mocked-statistics">MockStatistics</div>,
}))

describe("PlayerDeck", () => {
  it("renders all key subcomponents", () => {
    render(<PlayerDeck />)

    expect(screen.getByTestId("mocked-legality")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-last-update")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-source-badge")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-decklist")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-statistics")).toBeInTheDocument()
    expect(screen.getByLabelText("card-preview")).toBeVisible()
  })
})
