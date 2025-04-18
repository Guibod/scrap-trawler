import { beforeEach, describe, expect, it, type Mocked, vi } from "vitest"
import { createMock } from "@golevelup/ts-vitest"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import mockResponse from "~/resources/integrations/decks/data/archidekt/sample.duel.json"
import type SettingsService from "~/resources/domain/services/settings.service"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type EventService from "~/resources/domain/services/event.service"
import type CardService from "~/resources/domain/services/card.service"
import { sendToBackground } from "@plasmohq/messaging"
import { ArchidektFetcher } from "~/resources/integrations/decks/fetchers/archidekt.fetcher"

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

describe('ArchidektFetcher', () => {
  let fetcher: ArchidektFetcher
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
    const row = createRow('https://archidekt.com/decks/10712530/glarb_control', '10712530')
    fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)

    const request = new DeckFetchRequest("123", MTG_FORMATS.DUEL, row)
    const response = await fetcher.run(request)
    const deck = response.deck

    expect(deck.id).toBe('10712530')
    expect(deck.name).toBe('Glarb control')
    expect(deck.boards.commanders).toHaveLength(1)
    expect(deck.boards.commanders).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Glarb, Calamity's Augur",
          quantity: 1
        })
      ])
    )
    expect(deck.format).toBe(MTG_FORMATS.DUEL)
    expect(deck.legal).toBe(false)
    expect(deck.colors).toStrictEqual([MTG_COLORS.BLUE, MTG_COLORS.BLACK, MTG_COLORS.GREEN])
    expect(deck.face).toBeNull()
    expect(deck.lastUpdated).toBe("2025-02-27T20:28:00.879051Z")

    expect(response.success).toBe(true)
    expect(response.request).toBe(request)
    expect(response.rawData).toBe(mockResponse)
    expect(response.errorMessage).toBeUndefined()
  })

  it('generateId() returns correct ID', async () => {
    const row = createRow('https://archidekt.com/decks/123456', '123456')
    expect(await ArchidektFetcher.generateId(row)).toBe('archidekt:123456')
  })

  it('throws on invalid url in extractDeckId()', async () => {
    const row = createRow('https://not.Archidekt.com/badurl')
    fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
    const request = new DeckFetchRequest("123", MTG_FORMATS.DUEL, row)

    await expect(fetcher.run(request)).rejects.toThrow('Invalid Archidekt deck URL')
  })

  describe('parse() validates by format', () => {
    it(`DUEL`, async () => {
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.duel.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.DUEL)
      expect(deck.id).toEqual('10712530')
      expect(deck.legal).toBe(false)
      expect(deck.url).toEqual("https://archidekt.com/decks/10712530/glarb_control")
      expect(deck.face).toBeNull()
      expect(deck.lastUpdated).toBe('2025-02-27T20:28:00.879051Z')
      expect(deck.name).toBe('Glarb control')
      expect(deck.archetype).toBe('Glarb, Calamity\'s Augur')
      expect(deck.colors).toStrictEqual([MTG_COLORS.BLUE, MTG_COLORS.BLACK, MTG_COLORS.GREEN])
      expect(deck.boards.commanders).toHaveLength(1)
      expect(deck.boards.commanders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Glarb, Calamity's Augur",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.mainboard).toHaveLength(97)
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
            name: "Reanimate",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Island",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.companions).toHaveLength(0)
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })

    it(`EDH precon`, async () => {
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.commanderPrecon.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.COMMANDER)
      expect(deck.id).toEqual('12002085')
      expect(deck.legal).toBe(true)
      expect(deck.url).toEqual("https://archidekt.com/decks/12002085/jeskai_striker_-_tarkir:_dragonstorm_commander")
      expect(deck.face).toBeNull()
      expect(deck.lastUpdated).toBe('2025-03-20T12:58:14.370983Z')
      expect(deck.name).toBe('Jeskai Striker - Tarkir: Dragonstorm Commander')
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
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.commander.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.COMMANDER)
      expect(deck.id).toEqual('12594312')
      expect(deck.legal).toBe(false) // some cards are not yet legal
      expect(deck.url).toEqual("https://archidekt.com/decks/12594312/high_jodah_5c_ledends")
      expect(deck.face).toBeNull()
      expect(deck.lastUpdated).toBe('2025-04-18T12:48:00.760907Z')
      expect(deck.name).toBe('[High] Jodah, 5c Ledends')
      expect(deck.archetype).toBe('Jegantha, the Wellspring / Jodah, the Unifier')
      expect(deck.colors).toStrictEqual([MTG_COLORS.WHITE, MTG_COLORS.BLUE, MTG_COLORS.BLACK, MTG_COLORS.RED, MTG_COLORS.GREEN])
      expect(deck.boards.commanders).toHaveLength(1)
      expect(deck.boards.commanders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Jodah, the Unifier",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.mainboard).toHaveLength(99)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Surrak Dragonclaw",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Jhoira, Weatherlight Captain",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Ragavan, Nimble Pilferer",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Linvala, Shield of Sea Gate",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.companions).toHaveLength(1)
      expect(deck.boards.companions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Jegantha, the Wellspring",
            quantity: 1
          })
        ])
      )
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })

    it(`VINTAGE`, async () => {
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.vintage.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.VINTAGE)
      expect(deck.id).toEqual('11962422')
      expect(deck.legal).toBe(true) // some cards are not yet legal
      expect(deck.url).toEqual("https://archidekt.com/decks/11962422/miracle_multiplay_penta")
      expect(deck.face).toBeNull()
      expect(deck.lastUpdated).toBe('2025-04-18T09:13:17.347398Z')
      expect(deck.name).toBe('miracle multiplay penta')
      expect(deck.archetype).toBeNull() // archetype not supported in 60-card formats
      expect(deck.colors).toStrictEqual([MTG_COLORS.WHITE, MTG_COLORS.GREEN])
      expect(deck.boards.commanders).toHaveLength(0)
      expect(deck.boards.mainboard).toHaveLength(25)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Battle Angels of Tyr",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Scurry of Squirrels",
            quantity: 4
          }),
          expect.objectContaining({
            name: "Swords to Plowshares",
            quantity: 2
          }),
        ])
      )
      expect(deck.boards.companions).toHaveLength(0)
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.sideboard).toEqual([])
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })

    it(`MODERN`, async () => {
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.modern.companion.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.MODERN)
      expect(deck.id).toEqual('9650653')
      expect(deck.legal).toBe(true) // some cards are not yet legal
      expect(deck.url).toEqual("https://archidekt.com/decks/9650653/burninator_obosh")
      expect(deck.face).toBeNull()
      expect(deck.lastUpdated).toBe('2025-02-21T18:14:23.547721Z')
      expect(deck.name).toBe('Burninator Obosh')
      expect(deck.archetype).toBeNull() // archetype not supported in 60-card formats
      expect(deck.colors).toStrictEqual([MTG_COLORS.BLACK, MTG_COLORS.RED])
      expect(deck.boards.commanders).toHaveLength(0)
      expect(deck.boards.mainboard).toHaveLength(16)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Weaver of Lightning",
            quantity: 4
          }),
          expect.objectContaining({
            name: "Mountain",
            quantity: 20
          }),
          expect.objectContaining({
            name: "Bonecrusher Giant // Stomp",
            quantity: 4
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
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(0)
    })

    it(`OATHBREAKER`, async () => {
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.oathbreaker.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.OATHBREAKER)
      expect(deck.id).toEqual('5463464')
      expect(deck.legal).toBe(true) // some cards are not yet legal
      expect(deck.url).toEqual("https://archidekt.com/decks/5463464/daretti_-_artifacts")
      expect(deck.face).toBeNull()
      expect(deck.lastUpdated).toBe('2025-04-18T12:34:05.289314Z')
      expect(deck.name).toBe('Daretti  - Artifacts')
      expect(deck.archetype).toBe('Daretti, Scrap Savant / Faithless Looting')
      expect(deck.colors).toStrictEqual([MTG_COLORS.RED])
      expect(deck.boards.commanders).toHaveLength(1)
      expect(deck.boards.commanders).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Daretti, Scrap Savant",
            quantity: 1
          }),
        ])
      )
      expect(deck.boards.mainboard).toHaveLength(41)
      expect(deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Scrap Mastery",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Slobad, Iron Goblin",
            quantity: 1
          }),
          expect.objectContaining({
            name: "Goblin Welder",
            quantity: 1
          }),
        ])
      )
      expect(deck.boards.companions).toHaveLength(0)
      expect(deck.boards.sideboard).toHaveLength(0)
      expect(deck.boards.signatureSpells).toHaveLength(1)
      expect(deck.boards.signatureSpells).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Faithless Looting",
            quantity: 1
          }),
        ])
      )
    })

    it(`INVALID`, async () => {
      const payload = await import('~/resources/integrations/decks/data/archidekt/sample.invalid.json')

      fetcher = new ArchidektFetcher(mockSettings, mockCardService, mockEventService)
      const deck = await fetcher.parse(payload, null)

      expect(deck.format).toBe(MTG_FORMATS.OATHBREAKER)
      expect(deck.legal).toBe(false)
    })
  })
})
