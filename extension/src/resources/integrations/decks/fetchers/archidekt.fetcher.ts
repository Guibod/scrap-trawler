import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { CardNameAndQuantity, DeckBoards, DeckDescription } from "~/resources/storage/entities/event.entity"
import type SettingsService from "~/resources/domain/services/settings.service"
import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import type { FetchRequest, FetchResponse } from "~/background/messages/fetch/fetch"
import { getLogger } from "~/resources/logging/logger"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { sendToBackground } from "@plasmohq/messaging"

import type { LegalityBoard, LegalityBoards } from "~/resources/integrations/mtg-json/legality"
import slugify from "slugify"

const logger = getLogger("fetcher-archidekt")

const ArchidektColorMap: Record<string, MTG_COLORS | undefined> = {
  "White": MTG_COLORS.WHITE,
  "Blue": MTG_COLORS.BLUE,
  "Black": MTG_COLORS.BLACK,
  "Red": MTG_COLORS.RED,
  "Green": MTG_COLORS.GREEN
}

const ArchidektFormatMap: Record<number, MTG_FORMATS | undefined> = {
  1: MTG_FORMATS.STANDARD,
  2: MTG_FORMATS.MODERN,
  3: MTG_FORMATS.COMMANDER,
  4: MTG_FORMATS.LEGACY,
  5: MTG_FORMATS.VINTAGE,
  6: MTG_FORMATS.PAUPER,
  // 7: Custom,
  // 8: Frontier,
  // 9: Future,
  // 10: Penny,
  // 11: 1v1 Commander,
  12: MTG_FORMATS.DUEL,
  // 13: Strd. Brawl,
  14: MTG_FORMATS.OATHBREAKER,
  15: MTG_FORMATS.PIONEER,
  // 16: Historic,
  // 17: PDH,
  // 18: Alchemy,
  // 19: Explorer,
  // 20: Brawl,
  // 21: Gladiator,
  // 22: Premodern,
  // 23: PreDH,
  // 24: Timeless,
  // 25: Canlander
}

type ArchidektCard = {
  quantity: number
  card: {
    oracleCard: {
      name: string
      colorIdentity: string[]
      legalities: Record<string, string>
      types: string[]
    }
  }
  categories: string[]
  companion: boolean
}

type ArchidektCategory = {
  "id": number,
  "name": string,
  "isPremier": boolean,
  "includedInDeck": boolean,
}

type ArchidektRaw = {
  id: number
  name: string
  updatedAt: string
  deckFormat: number
  featured: string | null
  categories: ArchidektCategory[]
  cards: ArchidektCard[]
}

type ArchidektBoards = {
  mainboard: ArchidektCard[],
  sideboard?: ArchidektCard[],
  commanders?: ArchidektCard[],
  companions?: ArchidektCard[],
  signatureSpells?: ArchidektCard[],
}

type CategoryMap = Record<string, {ignore: boolean, premier: boolean}>

export class ArchidektFetcher extends AbstractDeckFetcher<ArchidektRaw> {
  public static readonly API_URL = "https://archidekt.com/api/decks"
  private categoryMap: CategoryMap = {}
  private rawBoards: ArchidektBoards = {
    mainboard: [],
    sideboard: [],
    commanders: [],
    companions: [],
    signatureSpells: []
  }

  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService)
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    return `archidekt:${this.extractDeckId(row.decklistUrl)}`
  }

  async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    const id = ArchidektFetcher.extractDeckId(request.row.decklistUrl)

    try {
      const response = await sendToBackground<FetchRequest, FetchResponse>({
        name: "fetch/fetch",
        body: {
          url: `${ArchidektFetcher.API_URL}/${id}/`
        }
      })

      if (!response.ok) throw new Error(`Failed to fetch Archidekt deck: ${response.error}`)

      return {
        request,
        deck: await this.parse(response.data, request),
        rawData: response.data,
        success: true
      }
    } catch (e) {
      logger.error(`Failed to fetch Archidekt deck ${request.row.decklistUrl}`)
      logger.exception(e)
      return {
        request,
        deck: null,
        rawData: undefined,
        errorMessage: e.message,
        success: false
      }
    }
  }

  async parse(raw: ArchidektRaw, _: DeckFetchRequest): Promise<DeckDescription> {
    this.parseSetup(raw)

    const format = ArchidektFormatMap[raw.deckFormat] ?? null

    raw.categories.forEach((category: ArchidektCategory) => {
      if (["Banned"].includes(category.name)) {
        return
      }
      this.categoryMap[category.name] = {
        ignore: !category.includedInDeck,
        premier: !!category.isPremier
      }
    })
   for (const entry of this.raw.cards) {
      const target = this.computeBoard(entry, format)
      if (target) {
        this.rawBoards[target].push(entry)
      } else {
        logger.warn(`Ignoring card ${entry.card.oracleCard.name} (${entry.quantity}) due to category mapping`)
      }
    }
    this.boards = Object.fromEntries(Object.entries(this.rawBoards).map(([boardName, value]) => {
      return [
        boardName,
        value.map((entry) => ({
          quantity: entry.quantity,
          name: entry.card.oracleCard.name,
        }))
      ]
    })) as DeckBoards

    let archetype= null
    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL, MTG_FORMATS.OATHBREAKER].includes(format)) {
      const archetypeCards = [ ...this.boards.commanders, ...this.boards.signatureSpells, ...this.boards.companions ]
      archetype = archetypeCards.map((card: CardNameAndQuantity) => card.name).sort().join(" / ")
    }

    const slug = slugify(raw.name, {lower: true, replacement: '_'})

    return this.describe({
      id: raw.id.toString(),
      name: raw.name,
      source: DeckSource.ARCHIDEKT,
      url: `https://archidekt.com/decks/${raw.id}/${slug}`,
      face: null, // raw.featured cannot be exploited, it’s not a card it’s an image
      format,
      archetype,
      lastUpdated: raw.updatedAt
    })
  }

  private computeBoard(entry: ArchidektCard, format: MTG_FORMATS): (keyof DeckBoards) | null {
    let target: keyof DeckBoards = "mainboard"

    for (const category of entry.categories) {
      if (this.categoryMap[category]?.ignore === true) {
        return null
      }
      if (this.categoryMap[category]?.premier === true) {
        target = "commanders"
        if (format === MTG_FORMATS.OATHBREAKER && entry.card.oracleCard.types.some(value => ["sorcery", "instant"].includes(value.toLowerCase()))) {
          target = "signatureSpells"
        }
        // or signatureSpells ?
      } else if (entry.categories.includes("Sideboard")) {
        target = "sideboard"

        if (entry.companion === true) {
          target = "companions"
        }
      }
    }

    return target
  }

  protected async buildLegalityBoards(): Promise<LegalityBoards> {
    const toLegalityBoard = (cards: ArchidektCard[]): LegalityBoard => {
      cards.forEach(c => c.card.oracleCard.colorIdentity?.forEach(ci => this.colorIdentity.add(ArchidektColorMap[ci] as MTG_COLORS)))

      return {
        count: cards.reduce((acc, c) => acc + c.quantity, 0),
        cards: cards.map(c => ({
          quantity: c.quantity,
          card: {
            name: c.card.oracleCard.name,
            legalities: c.card.oracleCard.legalities,
            colorIdentity: c.card.oracleCard.colorIdentity
          }
        }))
      }
    }

    const x= {
      mainboard: toLegalityBoard(this.rawBoards.mainboard),
      sideboard: toLegalityBoard(this.rawBoards.sideboard),
      commanders: toLegalityBoard(this.rawBoards.commanders),
      companions: toLegalityBoard(this.rawBoards.companions),
      signatureSpells: toLegalityBoard(this.rawBoards.signatureSpells)
    }
    return x
  }

  private static extractDeckId(url: string): string {
    const match = url?.match(/archidekt\.com\/decks\/(\d+)/)
    if (!match) throw new Error("Invalid Archidekt deck URL")
    return match[1]
  }
}
