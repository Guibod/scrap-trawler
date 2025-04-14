import { beforeAll, beforeEach, describe, expect, it, type Mocked, vi } from "vitest"
import { createMock } from "@golevelup/ts-vitest"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type SettingsService from "~/resources/domain/services/settings.service"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type EventService from "~/resources/domain/services/event.service"
import type CardService from "~/resources/domain/services/card.service"
import { sendToBackground } from "@plasmohq/messaging"
import { MagicVilleFetcher } from "~/resources/integrations/decks/fetchers/magic-ville.fetcher"
import { resolve } from "node:path"
import { readFileSync } from "node:fs"
import type { Legalities } from "~/resources/storage/entities/card.entity"

vi.mock("@plasmohq/messaging", () => ({
  sendToBackground: vi.fn()
}))

const path = resolve(__dirname, "../data/magicville/duel.txt")
const content = readFileSync(path, "utf8")

const createRow = (url: string, id = 'row-123'): SpreadsheetRow => ({
  id,
  player: {},
  archetype: 'Gruul Aggro',
  decklistUrl: url,
  decklistTxt: '',
  firstName: 'Garruk',
  lastName: 'Wildspeaker'
})

describe('MagicVilleFetcher', () => {
  let fetcher: MagicVilleFetcher
  let mockSettings: Mocked<SettingsService>
  let mockCardService: Mocked<CardService>
  const mockEventService = createMock<EventService>()

  beforeAll(() => {
    mockCardService = createMock<CardService>({
      searchCard: vi.fn(async (name: string) => ({
          name: name,
          colorIdentity: ['U', 'R'],
          legalities: {
            commander: 'legal',
            duel: 'legal',
          } as Legalities
        })
      )
    })
  })

  beforeEach(() => {
    vi.mocked(sendToBackground).mockResolvedValue({
      ok: true,
      data: content
    })
  })

  it('fetch() parses a full deck correctly', async () => {
    const row = createRow('https://www.magic-ville.com/fr/decks/showdeck?ref=1081471')
    fetcher = new MagicVilleFetcher(mockSettings, mockCardService, mockEventService)

    const request = new DeckFetchRequest("123", MTG_FORMATS.DUEL, row)
    const response = await fetcher.run(request)
    const deck = response.deck

    expect(deck.id).toBe('magic-ville:1081471')
    expect(deck.name).toBe('EDH KELLAN')
    expect(deck.boards.commanders).toHaveLength(1)
    expect(deck.boards.commanders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Kellan, Planar Trailblazer",
          quantity: 1
        })
      ])
    )
    expect(deck.format).toBe(MTG_FORMATS.DUEL)
    expect(deck.legal).toBe(true)
    expect(deck.colors).toStrictEqual([MTG_COLORS.BLUE, MTG_COLORS.RED])
    expect(deck.face).toEqual('Kellan, Planar Trailblazer')
    expect(deck.lastUpdated).toBeNull()

    expect(response.success).toBe(true)
    expect(response.request).toBe(request)
    expect(response.rawData).toBe(content)
    expect(response.errorMessage).toBeUndefined()
  })

  it('generateId() returns correct ID', async () => {
    const row = createRow('https://www.magic-ville.com/fr/decks/showdeck?ref=1081471', 'abc123')
    expect(await MagicVilleFetcher.generateId(row)).toBe('magic-ville:1081471')
  })

  it('throws on invalid url in extractDeckId()', async () => {
    const row = createRow('https://example.com/has/no/reference/get/param')
    fetcher = new MagicVilleFetcher(mockSettings, mockCardService, mockEventService)
    const request = new DeckFetchRequest("123", MTG_FORMATS.DUEL, row)

    await expect(fetcher.run(request)).rejects.toThrow('Could not extract MagicVille deck ID')
  })
})
