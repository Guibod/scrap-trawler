import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type SettingsService from "~/resources/domain/services/settings.service"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { TextFetcher } from "~/resources/integrations/decks/fetchers/text.fetcher"
import { createMock } from "@golevelup/ts-vitest"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { DeckFetchRequest } from "~/resources/integrations/decks/request"
import type { LeadershipSkills, Legalities } from "~/resources/storage/entities/card.entity"
import { readFileSync } from "node:fs"
import path from "node:path"


const mockEventService = createMock<EventService>({
  get: vi.fn(async () => ({ format: MTG_FORMATS.COMMANDER }))
})

beforeEach(() => {
  vi.resetAllMocks()
})

describe('TextFetcher', () => {
  const mockSettings = {} as SettingsService
  let fetcher: TextFetcher

  describe('using a mocked card service', () => {
    beforeAll(() => {
      const mockCardService = createMock<CardService>({
        searchCard: vi.fn(async (name: string) => {
            switch (name) {
              case 'Muldrotha, the Gravetide':
              case 'Muldrotha':
                return {
                  name: 'Muldrotha, the Gravetide',
                  colorIdentity: ['U', 'B', 'G'],
                  leadershipSkills: {
                    commander: true,
                  } as LeadershipSkills,
                  legalities: {
                    commander: 'legal',
                  } as Legalities
                }
              case 'Gyruda': // This is a partial match
              case 'Gyruda, Doom of Depths':
                return ({
                  name: 'Gyruda, Doom of Depths',
                  colorIdentity: ['U', 'B'],
                  leadershipSkills: {
                    commander: true,
                  } as LeadershipSkills,
                  legalities: {
                    commander: 'legal',
                  } as Legalities
                })
              case 'Glissa Sunslayer':
                return ({
                  name: 'Glissa Sunslayer',
                  colorIdentity: ['B', 'G'],
                  leadershipSkills: {
                    commander: true,
                  } as LeadershipSkills,
                  legalities: {
                    commander: 'legal',
                  } as Legalities
                })
              case 'Llanowar Elves':
                return ({
                  name: 'Llanowar Elves',
                  colorIdentity: ['G'],
                  leadershipSkills: {
                    commander: false,
                  } as LeadershipSkills,
                  legalities: {
                    commander: 'legal',
                  } as Legalities
                })
              case 'Forest':
                return ({
                  name: 'Forest',
                  leadershipSkills: {
                    commander: false,
                  } as LeadershipSkills,
                  legalities: {
                    commander: 'legal',
                  } as Legalities
                })
              default: null
            }
          }
        ) as unknown as CardService['searchCard']
      })
      fetcher = new TextFetcher(mockSettings, mockCardService, mockEventService)
    })

    it('parses a valid commander decklist (using MTGO way)', async () => {
      const request = new DeckFetchRequest('e1', MTG_FORMATS.COMMANDER, createRow([
        "97 Forest",
        "1 Glissa Sunslayer",
        "1 Gyruda, Doom of Depths",
        "",
        "1 Muldrotha, the Gravetide",
      ].join("\n")))
      const result = await fetcher.run(request)

      expect(result.success).toBe(true)
      expect(result.deck).toBeDefined()
      expect(result.deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Forest', quantity: 97 }),
          expect.objectContaining({ name: 'Glissa Sunslayer', quantity: 1 }),
          expect.objectContaining({ name: 'Gyruda, Doom of Depths', quantity: 1 })
        ])
      )
      expect(result.deck.boards.commanders).toHaveLength(1)
      expect(result.deck.boards.commanders).toEqual([
        expect.objectContaining({ name: 'Muldrotha, the Gravetide', quantity: 1 })
      ])
      expect(result.deck.boards.companions).toHaveLength(0)
      expect(result.deck.format).toBe(MTG_FORMATS.COMMANDER)
      expect(result.deck.colors).toEqual(expect.arrayContaining(['G', 'U', 'B']))
    })

    it('parses a valid commander decklist (using Moxfield way)', async () => {
      const request = new DeckFetchRequest('e1', MTG_FORMATS.COMMANDER, createRow([
        "1 Muldrotha, the Gravetide",
        "97 Forest",
        "1 Glissa Sunslayer",
        "1 Gyruda, Doom of Depths",
      ].join("\n")))
      const result = await fetcher.run(request)

      expect(result.success).toBe(true)
      expect(result.deck).toBeDefined()
      expect(result.deck.boards.mainboard).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Forest', quantity: 97 }),
          expect.objectContaining({ name: 'Glissa Sunslayer', quantity: 1 }),
          expect.objectContaining({ name: 'Gyruda, Doom of Depths', quantity: 1 })
        ])
      )
      expect(result.deck.boards.commanders).toHaveLength(1)
      expect(result.deck.boards.commanders).toEqual([
        expect.objectContaining({ name: 'Muldrotha, the Gravetide', quantity: 1 })
      ])
      expect(result.deck.boards.companions).toHaveLength(0)
      expect(result.deck.format).toBe(MTG_FORMATS.COMMANDER)
      expect(result.deck.colors).toEqual(expect.arrayContaining(['G', 'U', 'B']))
    })

    it('generateId produces stable hash', async () => {
      const row = createRow(["1 Forest", "1 Gyruda"].join("\n"))
      const id1 = await TextFetcher.generateId(row)
      const id2 = await TextFetcher.generateId(row)
      expect(id1).toBe(id2)
    })

    it('succeed on unknown card', async () => {
      const row = createRow([
        "1 Forest",
        "1 Gyruda",
        "1 SomeFakeCardName"
      ].join("\n"))
      const request = new DeckFetchRequest('e1', MTG_FORMATS.DUEL, row)

      const result = await fetcher.run(request)
      expect(result.success).toBe(true)
      expect(result.errorMessage).toBeUndefined()
    })
  })

  describe('using real world decklist and card service says everything is legal and a commander', () => {
    const mockCardService = createMock<CardService>({
      searchCard: vi.fn(async (name: string) => {
        return {
          name: name,
          colorIdentity: ['W', 'U', 'B', 'R', 'G'],
          leadershipSkills: {
            commander: true,
          } as LeadershipSkills,
          legalities: createUniformMock<Legalities>('legal')
        }
      }) as unknown as CardService['searchCard']
    })
    const fetcher = new TextFetcher(mockSettings, mockCardService, mockEventService)

    describe('Commander, 2 partners', () => {
      it("à la Moxfield", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/commander.2partners.moxfield.txt'), 'utf-8');
        const row = createRow(decklist)
        const request = new DeckFetchRequest('e1', MTG_FORMATS.DUEL, row)
        vi.mocked(mockEventService.get).mockResolvedValue({ format: MTG_FORMATS.COMMANDER })

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Gruul Aggro")
        expect(response.deck.archetype).toEqual("Vial Smasher the Fierce / Yoshimaru, Ever Faithful")
        expect(response.deck.id).toEqual("text:d7c656b0fe9163fab23b2771776fb363975784e2")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Vial Smasher the Fierce")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(87)
        expect(response.deck.boards.commanders).toHaveLength(2)
      })

      it("à la MTGO", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/commander.2partners.mtgo.txt'), 'utf-8');
        const row = createRow(decklist)
        const request = new DeckFetchRequest('e1', MTG_FORMATS.DUEL, row)

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Gruul Aggro")
        expect(response.deck.archetype).toEqual("Vial Smasher the Fierce / Yoshimaru, Ever Faithful")
        expect(response.deck.id).toEqual("text:78d023636cd9ea43b95778afc2dfe3f3ebbb9e64")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Vial Smasher the Fierce")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(87)
        expect(response.deck.boards.commanders).toHaveLength(2)
      })
    })

    describe('Standard', () => {
      it("à la Moxfield", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/standard.moxfield.txt'), 'utf-8');
        const row = createRow(decklist)
        const request = new DeckFetchRequest('e1', MTG_FORMATS.STANDARD, row)
        vi.mocked(mockEventService.get).mockResolvedValue({ format: MTG_FORMATS.STANDARD })

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Gruul Aggro")
        expect(response.deck.archetype).toEqual("Gruul Aggro")
        expect(response.deck.id).toEqual("text:213af52464a84f0d60389950ff53c9bed904f11e")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Deadly Cover-Up")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(27)
        expect(response.deck.boards.commanders).toHaveLength(0)
        expect(response.deck.boards.sideboard).toHaveLength(7)
      })

      it("à la MTGO", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/standard.mtgo.txt'), 'utf-8');
        const row = createRow(decklist)
        vi.mocked(mockEventService.get).mockResolvedValue({ format: MTG_FORMATS.STANDARD })
        const request = new DeckFetchRequest('e1', MTG_FORMATS.STANDARD, row)

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Gruul Aggro")
        expect(response.deck.archetype).toEqual("Gruul Aggro")
        expect(response.deck.id).toEqual("text:8e8474956716a4d9abb1c8a56f03d6239eea5785")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Deadly Cover-Up")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(27)
        expect(response.deck.boards.commanders).toHaveLength(0)
        expect(response.deck.boards.sideboard).toHaveLength(7)
      })

      it("à la MTGA", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/standard.mtga.txt'), 'utf-8');
        const row = createRow(decklist)
        vi.mocked(mockEventService.get).mockResolvedValue({ format: MTG_FORMATS.STANDARD })
        const request = new DeckFetchRequest('e1', MTG_FORMATS.STANDARD, row)

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Sab-Sunen")
        expect(response.deck.archetype).toEqual("Gruul Aggro")
        expect(response.deck.id).toEqual("text:181a36ff0f32e4184b350e05de3e26128359642d")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Deadly Cover-Up")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(27)
        expect(response.deck.boards.commanders).toHaveLength(0)
        expect(response.deck.boards.sideboard).toHaveLength(7)
      })
    })

    describe('Oathbreaker', () => {
      it("à la Moxfield", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/oathbreaker.moxfield.txt'), 'utf-8');
        const row = createRow(decklist)
        const request = new DeckFetchRequest('e1', MTG_FORMATS.OATHBREAKER, row)
        vi.mocked(mockEventService.get).mockResolvedValue({ format: MTG_FORMATS.OATHBREAKER })

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Gruul Aggro")
        expect(response.deck.archetype).toEqual("Nissa of Shadowed Boughs / Reanimate")
        expect(response.deck.id).toEqual("text:fd0459e6258fd870c0a77b8f5ad6163ca58cc66f")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Nissa of Shadowed Boughs")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(34)
        expect(response.deck.boards.signatureSpells).toHaveLength(1)
        expect(response.deck.boards.commanders).toHaveLength(1)
        expect(response.deck.boards.sideboard).toHaveLength(1)
      })

      it("à la MTGO", async () => {
        const decklist = readFileSync(path.join(__dirname, '../data/text/oathbreaker.mtgo.txt'), 'utf-8');
        const row = createRow(decklist)
        vi.mocked(mockEventService.get).mockResolvedValue({ format: MTG_FORMATS.OATHBREAKER })
        const request = new DeckFetchRequest('e1', MTG_FORMATS.OATHBREAKER, row)

        const response = await fetcher.run(request)

        expect(response.success).toBe(true)
        expect(response.rawData).toEqual(decklist)
        expect(response.deck.name).toEqual("Gruul Aggro")
        expect(response.deck.archetype).toEqual("Nissa of Shadowed Boughs / Reanimate")
        expect(response.deck.id).toEqual("text:5bcf865e7a4c65b7d34db674f127e6a8f099b582")
        expect(response.deck.url).toBeNull()
        expect(response.deck.face).toEqual("Nissa of Shadowed Boughs")
        expect(response.deck.lastUpdated).toBeNull()
        expect(response.deck.legal).toBe(true)
        expect(response.deck.boards.mainboard).toHaveLength(34)
        expect(response.deck.boards.signatureSpells).toHaveLength(1)
        expect(response.deck.boards.commanders).toHaveLength(1)
        expect(response.deck.boards.sideboard).toHaveLength(1)
      })
    })
  })
})


const createUniformMock = <T extends object>(value: any): T =>
  new Proxy({}, {
    get: () => value
  }) as T;

const createRow = (txt: string, id = 'row-123'): SpreadsheetRow => ({
  id,
  player: {},
  archetype: 'Gruul Aggro',
  decklistUrl: '',
  decklistTxt: txt,
  firstName: 'Garruk',
  lastName: 'Wildspeaker'
})