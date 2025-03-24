import { describe, it, expect, beforeEach, vi, type Mocked } from "vitest"
import { createMock } from '@golevelup/ts-vitest'
import type { SpreadsheetRow } from '~/resources/domain/dbos/spreadsheet.dbo'
import mockResponse from '~/resources/integrations/decks/data/moxfield/sample.duel.json'
import { MoxfieldFetcher } from "~/resources/integrations/decks/fetchers/moxfield.fetcher"
import type SettingsService from "~/resources/domain/services/settings.service"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type EventService from "~/resources/domain/services/event.service"
import type CardService from "~/resources/domain/services/card.service"
import { sendToBackground } from "@plasmohq/messaging"

vi.mock("@plasmohq/messaging", () => ({
  sendToBackground: vi.fn()
}))

const createRow = (url: string, id = 'row-123'): SpreadsheetRow => ({
  id,
  player: {},
  archetype: 'Gruul Aggro',
  decklistUrl: url,
  decklistTxt: '',
  firstName: 'Garruk',
  lastName: 'Wildspeaker'
})

describe('MoxfieldFetcher', () => {
  let fetcher: MoxfieldFetcher
  let mockSettings: Mocked<SettingsService>
  const mockCardService = createMock<CardService>()
  const mockEventService = createMock<EventService>()

  beforeEach(() => {
    vi.mocked(sendToBackground).mockResolvedValue({
      ok: true,
      data: mockResponse
    })
  })

  it('fetch() parses a full deck correctly', async () => {
    const row = createRow('https://www.moxfield.com/decks/uhT3ukey6kqMXDc1g-_HYg')
    fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)

    const request = new DeckFetchRequest("123", row)
    const response = await fetcher.run(request)
    const deck = response.deck

    expect(deck.id).toBe('uhT3ukey6kqMXDc1g-_HYg')
    expect(deck.name).toBe('Malcolm 👀 - working')
    expect(deck.boards.commanders).toHaveLength(1)
    expect(deck.boards.commanders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Malcolm, the Eyes",
          quantity: 1
        })
      ])
    )
    expect(deck.format).toBe(MTG_FORMATS.DUEL)
    expect(deck.legal).toBe(true)
    expect(deck.colors).toStrictEqual([MTG_COLORS.BLUE, MTG_COLORS.RED])
    expect(deck.face).toEqual('Malcolm, the Eyes')
    expect(deck.lastUpdated).toBe("2025-03-15T22:14:01.177Z")

    expect(response.success).toBe(true)
    expect(response.request).toBe(request)
    expect(response.rawData).toBe(mockResponse)
    expect(response.errorMessage).toBeUndefined()
  })

  it('generateId() returns correct ID', async () => {
    const row = createRow('https://moxfield.com/decks/abc123', 'abc123')
    expect(await MoxfieldFetcher.generateId(row)).toBe('moxfield:abc123')
  })

  it('throws on invalid url in extractDeckId()', async () => {
    const row = createRow('https://not.moxfield.com/badurl')
    fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
    const request = new DeckFetchRequest("123", row)

    await expect(fetcher.run(request)).rejects.toThrow('Invalid Moxfield deck URL')
  })

  describe('parse() validates by format', () => {
    it(`DUEL`, async () => {
      const payload = await import('~/resources/integrations/decks/data/moxfield/sample.duel.json')

      fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload)

      expect(deck.format).toBe(MTG_FORMATS.DUEL)
      expect(deck.id).toEqual('uhT3ukey6kqMXDc1g-_HYg')
      expect(deck.legal).toBe(true)
      expect(deck.url).toEqual("https://moxfield.com/decks/uhT3ukey6kqMXDc1g-_HYg")
      expect(deck.face).toEqual('Malcolm, the Eyes')
      expect(deck.lastUpdated).toBe('2025-03-15T22:14:01.177Z')
      expect(deck.name).toBe('Malcolm 👀 - working')
      expect(deck.archetype).toBe('Malcolm, the Eyes')
      expect(deck.colors).toStrictEqual([MTG_COLORS.BLUE, MTG_COLORS.RED])
      expect(deck.boards.commanders).toHaveLength(1)
      expect(deck.boards.commanders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Malcolm, the Eyes",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.mainboard).toHaveLength(86)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Force of Will",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Brainstorm",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Island",
            quantity: 11
          }),
          expect.objectContaining({
            name: "Mountain",
            quantity: 4
          })
        ])
      )
      expect(deck.boards.companions).toHaveLength(0)
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })

    it(`EDH precon`, async () => {
      const payload = await import('~/resources/integrations/decks/data/moxfield/sample.commanderPrecon.json')

      fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload)

      expect(deck.format).toBe(MTG_FORMATS.COMMANDER)
      expect(deck.id).toEqual('90IaIz_OaUyg1oE7a2OQsw')
      expect(deck.legal).toBe(false) // some cards are not yet legal
      expect(deck.url).toEqual("https://moxfield.com/decks/90IaIz_OaUyg1oE7a2OQsw")
      expect(deck.face).toEqual('Shiko and Narset, Unified')
      expect(deck.lastUpdated).toBe('2025-03-20T17:34:36.407Z')
      expect(deck.name).toBe('Jeskai Striker (Tarkir Dragonstorm Commander Precon Decklist)')
      expect(deck.archetype).toBe('Shiko and Narset, Unified')
      expect(deck.colors).toStrictEqual([MTG_COLORS.WHITE, MTG_COLORS.BLUE, MTG_COLORS.RED])
      expect(deck.boards.commanders).toHaveLength(1)
      expect(deck.boards.commanders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Shiko and Narset, Unified",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.mainboard).toHaveLength(88)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Elsha, Threefold Master",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Aligned Heart",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Island",
            quantity: 5
          }),
          expect.objectContaining({
            name: "Mountain",
            quantity: 5
          })
        ])
      )
      expect(deck.boards.companions).toHaveLength(0)
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })

    it(`COMMANDER`, async () => {
      const payload = await import('~/resources/integrations/decks/data/moxfield/sample.commander.json')

      fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload)

      expect(deck.format).toBe(MTG_FORMATS.COMMANDER)
      expect(deck.id).toEqual('Z7Dp0wbuQkujW7Ggg5Lotw')
      expect(deck.legal).toBe(true) // some cards are not yet legal
      expect(deck.url).toEqual("https://moxfield.com/decks/Z7Dp0wbuQkujW7Ggg5Lotw")
      expect(deck.face).toEqual('Bello, Bard of the Brambles')
      expect(deck.lastUpdated).toBe('2025-03-21T10:55:44Z')
      expect(deck.name).toBe('Inanimate Objects Are Dangerous')
      expect(deck.archetype).toBe('Bello, Bard of the Brambles')
      expect(deck.colors).toStrictEqual([MTG_COLORS.RED, MTG_COLORS.GREEN])
      expect(deck.boards.commanders).toHaveLength(1)
      expect(deck.boards.commanders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Bello, Bard of the Brambles",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.mainboard).toHaveLength(81)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Temple of Abandon",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Elvish Mystic",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Forest",
            quantity: 12
          }),
          expect.objectContaining({
            name: "Mountain",
            quantity: 8
          })
        ])
      )
      expect(deck.boards.companions).toHaveLength(0)
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })
  })

  it(`VINTAGE`, async () => {
    const payload = await import('~/resources/integrations/decks/data/moxfield/sample.vintage.json')

    fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
    const deck = await fetcher.parse(payload)

    expect(deck.format).toBe(MTG_FORMATS.VINTAGE)
    expect(deck.id).toEqual('dzbbTBxBO0eztDWTZpUHQw')
    expect(deck.legal).toBe(true) // some cards are not yet legal
    expect(deck.url).toEqual("https://moxfield.com/decks/dzbbTBxBO0eztDWTZpUHQw")
    expect(deck.face).toEqual('Fastbond')
    expect(deck.lastUpdated).toBe('2025-03-21T09:36:40.153Z')
    expect(deck.name).toBe('Fastbond Lands - Vintage')
    expect(deck.archetype).toBeNull() // archetype not supported in 60-card formats
    expect(deck.colors).toStrictEqual([MTG_COLORS.WHITE, MTG_COLORS.BLUE, MTG_COLORS.BLACK, MTG_COLORS.RED, MTG_COLORS.GREEN])
    expect(deck.boards.commanders).toHaveLength(0)
    expect(deck.boards.mainboard).toHaveLength(49)
    expect(deck.boards.mainboard).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Fastbond",
          quantity: 4
        }),
        expect.objectContaining({
          name: "Black Lotus",
          quantity: 1
        }),
        expect.objectContaining({
          name: "The Tabernacle at Pendrell Vale",
          quantity: 1
        }),
      ])
    )
    expect(deck.boards.companions).toHaveLength(0)
    expect(deck.boards.sideboard).toHaveLength(15)
    expect(deck.boards.sideboard).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Tolarian Academy",
          quantity: 1
        }),
        expect.objectContaining({
          name: "Vexing Bauble",
          quantity: 1
        }),
        expect.objectContaining({
          name: "Karakas",
          quantity: 1
        }),
      ])
    )
    expect(deck.boards.signatureSpells).toHaveLength(0)
  })

  it(`MODERN`, async () => {
    const payload = await import('~/resources/integrations/decks/data/moxfield/sample.modern.companion.json')

    fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
    const deck = await fetcher.parse(payload)

    expect(deck.format).toBe(MTG_FORMATS.MODERN)
    expect(deck.id).toEqual('J5POnqpW6EujghVgbIZMWw')
    expect(deck.legal).toBe(true) // some cards are not yet legal
    expect(deck.url).toEqual("https://moxfield.com/decks/J5POnqpW6EujghVgbIZMWw")
    expect(deck.face).toEqual('Faithless Looting')
    expect(deck.lastUpdated).toBe('2025-03-18T17:41:28.66Z')
    expect(deck.name).toBe('Seismic Obosh')
    expect(deck.archetype).toBeNull() // archetype not supported in 60-card formats
    expect(deck.colors).toStrictEqual([MTG_COLORS.BLACK, MTG_COLORS.RED])
    expect(deck.boards.commanders).toHaveLength(0)
    expect(deck.boards.mainboard).toHaveLength(17)
    expect(deck.boards.mainboard).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Seismic Assault",
          quantity: 4
        }),
        expect.objectContaining({
          name: "Faithless Looting",
          quantity: 4
        }),
        expect.objectContaining({
          name: "Meltdown",
          quantity: 2
        }),
      ])
    )
    expect(deck.boards.companions).toHaveLength(1)
    expect(deck.boards.companions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "Obosh, the Preypiercer",
        quantity: 1
      }),
    ]))
    expect(deck.boards.sideboard).toHaveLength(1)
    expect(deck.boards.companions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: "Obosh, the Preypiercer",
        quantity: 1
      }),
    ]))
    expect(deck.boards.signatureSpells).toHaveLength(0)
  })

  it(`OATHBREAKER`, async () => {
    const payload = await import('~/resources/integrations/decks/data/moxfield/sample.oathbreaker.json')

    fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
    const deck = await fetcher.parse(payload)

    expect(deck.format).toBe(MTG_FORMATS.OATHBREAKER)
    expect(deck.id).toEqual('Blne9sZXzUakIy7oeVaXJA')
    expect(deck.legal).toBe(true) // some cards are not yet legal
    expect(deck.url).toEqual("https://moxfield.com/decks/Blne9sZXzUakIy7oeVaXJA")
    expect(deck.face).toEqual('Nissa of Shadowed Boughs')
    expect(deck.lastUpdated).toBe('2025-03-21T10:18:22.17Z')
    expect(deck.name).toBe('nissa elemental oathbreaker')
    expect(deck.archetype).toBe('Nissa of Shadowed Boughs / Reanimate')
    expect(deck.colors).toStrictEqual([MTG_COLORS.BLACK, MTG_COLORS.GREEN])
    expect(deck.boards.commanders).toHaveLength(1)
    expect(deck.boards.commanders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Nissa of Shadowed Boughs",
          quantity: 1
        }),
      ])
    )
    expect(deck.boards.mainboard).toHaveLength(34)
    expect(deck.boards.mainboard).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Nyxbloom Ancient",
          quantity: 1
        }),
        expect.objectContaining({
          name: "Cultivate",
          quantity: 1
        }),
        expect.objectContaining({
          name: "Cut Down",
          quantity: 1
        }),
      ])
    )
    expect(deck.boards.companions).toHaveLength(0)
    expect(deck.boards.sideboard).toHaveLength(1)
    expect(deck.boards.signatureSpells).toHaveLength(1)
    expect(deck.boards.signatureSpells).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Reanimate",
          quantity: 1
        }),
      ])
    )
  })

  it(`INVALID`, async () => {
    const payload = await import('~/resources/integrations/decks/data/moxfield/sample.invalid.json')

    fetcher = new MoxfieldFetcher(mockSettings, mockCardService, mockEventService)
    const deck = await fetcher.parse(payload)

    expect(deck.format).toBe(MTG_FORMATS.COMMANDER)
    expect(deck.legal).toBe(false)
  })
})
