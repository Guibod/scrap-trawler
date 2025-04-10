import { vi, describe, expect, beforeAll, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import PlayerDeck from "~/resources/ui/components/player/deck"
import React from "react"
import DeckFetcherResolver from "~/resources/integrations/decks/resolver"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import { NothingFetcher } from "~/resources/integrations/decks/fetchers/nothing.fetcher"
import { useDeck } from "~/resources/ui/components/deck/provider"
import { usePlayer } from "~/resources/ui/providers/event"
import type { PlayerProfile } from "~/resources/domain/mappers/player.mapper"
import type { ResolvedDeckDbo } from "~/resources/domain/mappers/deck.mapper"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"

// Mocks for providers
vi.mock("~/resources/ui/components/deck/provider", () => ({
  useDeck: vi.fn(),
}))

vi.mock("~/resources/ui/providers/event", () => ({
  useEvent: () => ({ event: { id: 1 } }),
  usePlayer: vi.fn(),
}))

vi.mock("~/resources/ui/providers/fetcher", () => ({
  useFetchService: () => ({
    fetchDeckRows: vi.fn(),
  }),
  useEventFetchStatus: () => ({ isFetching: false }),
}))

describe("PlayerDeck", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(useDeck).mockReturnValue({
      deck: { id: "deck1", boards: { mainboard: [] } } as ResolvedDeckDbo,
      analyzer: null,
      hoveredCard: { imageMedium: "https://example.com/card.jpg" } as CardDbo,
      onHoveredCard: vi.fn(),
    })

    vi.mocked(usePlayer).mockReturnValue({
      spreadsheetRowId: "1",
      archetype: "Simic Mutate",
      decklistUrl: "https://moxfield.com/deck/123",
      decklistTxt: "",
      firstName: "G",
      lastName: "B"
    } as PlayerProfile)

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
  })

  it("renders all key subcomponents", () => {
    render(<PlayerDeck />)

    expect(screen.getByTestId("mocked-legality")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-last-update")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-source-badge")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-decklist")).toBeInTheDocument()
    expect(screen.getByTestId("mocked-statistics")).toBeInTheDocument()
    expect(screen.getByLabelText("card-preview")).toBeVisible()
  })

  it("renders danger alert when deck is missing", () => {
    vi.mocked(useDeck).mockReturnValue({ deck: null } as any)

    render(<PlayerDeck />)
    expect(screen.getByText(/No Deck data/i)).toBeInTheDocument()
    expect(screen.getByText(/file a bug report/i)).toBeInTheDocument()
  })

  it("renders warning alert for unsupported deck source", () => {
    vi.mocked(useDeck).mockReturnValue({ deck: { boards: null } } as any)
    vi.mocked(usePlayer).mockReturnValue({
      spreadsheetRow: { decklistUrl: "https://badsite.com/deck/42" },
    } as any)
    vi.spyOn(DeckFetcherResolver, "resolveFetcherType").mockReturnValue(NothingFetcher)

    render(<PlayerDeck />)

    expect(screen.getByText(/Missing support for this external source/i)).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/badsite.com\/deck\/42/)).toBeInTheDocument()
  })

  it("renders error alert on fetch failure", () => {
    vi.mocked(useDeck).mockReturnValue({
      deck: {
        boards: null,
        status: DeckStatus.FAILED,
        errors: ["Deck not found", "Invalid format"],
      },
    } as any)

    vi.mocked(usePlayer).mockReturnValue({
      spreadsheetRow: { decklistUrl: "https://moxfield.com/deck/123" },
    } as any)

    render(<PlayerDeck />)

    expect(screen.getByText(/Failed to recover the deck/i)).toBeInTheDocument()
    expect(screen.getByText(/Deck not found/)).toBeInTheDocument()
    expect(screen.getByText(/Invalid format/)).toBeInTheDocument()
  })

  it("renders info alert when deck exists but has no mainboard", () => {
    vi.mocked(useDeck).mockReturnValue({
      deck: { boards: {} },
    } as any)

    vi.mocked(usePlayer).mockReturnValue({
      spreadsheetRow: { decklistUrl: "https://moxfield.com/deck/123" },
    } as any)

    render(<PlayerDeck />)
    expect(screen.getByText(/No deck found/i)).toBeInTheDocument()
    expect(screen.getByText(/https:\/\/moxfield.com\/deck\/123/)).toBeInTheDocument()
  })
})
