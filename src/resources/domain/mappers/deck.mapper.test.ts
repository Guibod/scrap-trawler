import { beforeEach, describe, expect, it, vi } from "vitest"
import { DeckMapper } from "~/resources/domain/mappers/deck.mapper"
import type CardService from "~/resources/domain/services/card.service"
import { type DeckDbo, DeckSource, DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import { createMock } from "@golevelup/ts-vitest"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

describe("DeckMapper", () => {
  const fakeCard = (name: string) => ({
    id: name,
    name,
    manaCost: "{1}{U}",
    typeLine: "Creature — Illusion",
    // ...other fields if needed
  })
  const mockCardService = createMock<CardService>({
    searchCard: vi.fn().mockImplementation((name: string) => Promise.resolve(fakeCard(name))),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mapper = new DeckMapper(mockCardService as CardService)

  it("resolves all boards into ResolvedDeckBoards", async () => {
    const raw: DeckDbo = {
      archetype: "Gruul Aggro",
      colors: [MTG_COLORS.GREEN, MTG_COLORS.RED],
      face: "Foo Bar, of the Baz",
      format: MTG_FORMATS.MODERN,
      id: "foo",
      lastUpdated: undefined,
      legal: true,
      source: DeckSource.UNKNOWN,
      spreadsheetRowId: "B23",
      status: DeckStatus.FETCHED,
      boards: {
        mainboard: [{ name: "Snapcaster Mage", quantity: 2 }],
        sideboard: [{ name: "Negate", quantity: 1 }],
        commanders: [{ name: "Animar, Soul of Elements", quantity: 1 }],
      }
    }

    const resolved = await mapper.toResolvedDeck(raw)

    expect(resolved.boards.mainboard[0].card.name).toBe("Snapcaster Mage")
    expect(resolved.boards.sideboard?.[0].card.name).toBe("Negate")
    expect(resolved.boards.commanders?.[0].card.name).toBe("Animar, Soul of Elements")
    expect(resolved.boards.mainboard[0].quantity).toBe(2)

    expect(mockCardService.searchCard).toHaveBeenCalledWith("Snapcaster Mage")
    expect(mockCardService.searchCard).toHaveBeenCalledTimes(3)
  })

  it("Will omit a card if it can’t be resolved", async () => {
    mockCardService.searchCard.mockResolvedValue(null)

    const mapper = new DeckMapper(mockCardService)
    const mapped = await mapper.toResolvedDeck({
      archetype: "Gruul Aggro",
      colors: [MTG_COLORS.GREEN, MTG_COLORS.RED],
      face: "Foo Bar, of the Baz",
      format: MTG_FORMATS.MODERN,
      id: "foo",
      lastUpdated: undefined,
      legal: true,
      source: DeckSource.UNKNOWN,
      spreadsheetRowId: "B23",
      status: DeckStatus.FETCHED,
      boards: {
        mainboard: [{ name: "Fake Card", quantity: 1 }],
      }
    })

    expect(mapped.archetype).toBe("Gruul Aggro")
    expect(mapped.boards.mainboard).toEqual([])
  })
})
