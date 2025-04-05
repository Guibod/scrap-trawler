import AbstractDeckFetcher from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type SettingsService from "~/resources/domain/services/settings.service"
import type { CardNameAndQuantity, DeckDescription } from "~/resources/storage/entities/event.entity"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { resolveEnumValue } from "~/resources/utils/enum"
import { hashStringSHA1 } from "~/resources/utils/crypto"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { checkLegality, getCommanderIdentity, type LegalityBoard } from "~/resources/integrations/mtg-json/legality"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"

type CardDboAndQuantity = {
  quantity: number,
  card: CardDbo
}
type CardDboBoard = {
  mainboard: CardDboAndQuantity[],
  sideboard: CardDboAndQuantity[],
  commanders: CardDboAndQuantity[],
  companions: CardDboAndQuantity[],
  signatureSpells: CardDboAndQuantity[],
}

export class TextFetcher extends AbstractDeckFetcher {
  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService)
  }

  public async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    const raw = request.row.decklistTxt
    const format = (await this.eventService.get(request.eventId))?.format

    try {
      const deck = await this.parse(raw, format, request.row.archetype)
      return {
        request,
        deck,
        rawData: raw,
        success: true
      }
    } catch (error) {
      return {
        request,
        deck: null,
        rawData: raw,
        errorMessage: (error as Error).message,
        success: false
      }
    }
  }


  private colorIdentity = new Set<MTG_COLORS>()
  public async parse(raw: string, format: MTG_FORMATS, archetypeHint?: string): Promise<DeckDescription> {
    let archetype: string | null = archetypeHint ?? null
    let name: string | null = archetypeHint ?? null
    let commanderColors: MTG_COLORS[] = null
    this.colorIdentity.clear()

    const lines = raw.split(/\r?\n/)
    const boards: CardDboBoard = {
      mainboard: [],
      sideboard: [],
      commanders: [],
      companions: [],
      signatureSpells: [],
    }

    let currentTarget = boards.mainboard
    let hasCommanderSeparator = false
    let unsortedFirstLines = 0
    let lineSinceSeparator = 0
    let lastCard: CardDbo | null = null
    let currentCard: CardDbo | null = null
    let i = 0
    let previousIsBlank = false

    if (lines[0] === 'About') {
      lines.shift()
      name = lines.shift().slice(5)
    }

    for (const line of lines) {
      if (line.trim() === '') {
        previousIsBlank = true
        continue
      }

      if (line.toUpperCase().startsWith('DECK')) {
        currentTarget = boards.mainboard
        previousIsBlank = false
        continue
      }

      if (line.toUpperCase().startsWith('SIDEBOARD')) {
        currentTarget = boards.sideboard
        previousIsBlank = false
        continue
      }

      if (previousIsBlank) {
        hasCommanderSeparator = true
        previousIsBlank = false
        lineSinceSeparator = 0
      }

      lineSinceSeparator++
      currentCard = await this.parseLine(line, currentTarget)
      if (i <= 3 && lastCard && lastCard.name.localeCompare(currentCard?.name) > 0) {
        unsortedFirstLines = i
      }
      lastCard = currentCard
      i++
    }

    // Commander shenanigans
    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL, MTG_FORMATS.OATHBREAKER].includes(format)) {
      if (hasCommanderSeparator){ // mtgo way
        if (lineSinceSeparator <= 2) {
          const candidates = currentTarget.splice(currentTarget.length - lineSinceSeparator, lineSinceSeparator);
          boards.commanders.push(...candidates)
        }
      }

      if (unsortedFirstLines > 0) { // Moxfield way
        const candidates = boards.mainboard.splice(0, unsortedFirstLines);
        boards.commanders.push(...candidates)
      }

      if (format === MTG_FORMATS.OATHBREAKER) {
        boards.signatureSpells.push(boards.commanders.pop())
      }

      if (boards.commanders.length) {
        const archetypeCards = [ ...boards.commanders, ...boards.signatureSpells, ...boards.companions ]
        archetype = archetypeCards.map((card: CardDboAndQuantity) => card.card.name).sort().join(" / ")
        commanderColors = getCommanderIdentity(this.buildBoards(boards, this.extractLegalityCardAndQuantities))
      }
    }

    // if there is a companion, it should be put in the companion board
    const hash = await hashStringSHA1(raw.trim())

    return {
      id: `text:${hash}`,
      url: null,
      archetype,
      source: DeckSource.TEXT,
      face: boards.commanders[0]?.card.name || boards.mainboard[0]?.card.name || null,
      lastUpdated: null,
      name,
      boards: this.buildBoards(boards, this.extractCardNamesAndQuantities),
      format,
      legal: checkLegality(this.buildBoards(boards, this.extractLegalityCardAndQuantities), format),
      colors: commanderColors ?? [...this.colorIdentity]
    }
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    const hash = await hashStringSHA1(row.decklistTxt.trim())
    return `text:${hash}`
  }

  async applyThrottle(): Promise<this> {
    return this
  }

  private async parseLine(line: string, collection: CardDboAndQuantity[]): Promise<CardDbo | null> {
    const trimmed = line.trim()
    if (!trimmed || /^[A-Z][A-Z ]+:$/.test(trimmed)) return

    const regex = /^(?:(?<quantity>\d+)\s+)?(?<name>.+?)(?:\s+\(.*)?$/i
    const match = trimmed.match(regex)?.groups
    if (!match) return

    const quantity = match.quantity ? parseInt(match.quantity, 10) : 1
    const name = match.name.trim()
    const card = await this.cardService.searchCard(name)
    if (!card) throw new Error(`Card not found: ${name}`)

    card.colorIdentity?.forEach(c => this.colorIdentity.add(resolveEnumValue(MTG_COLORS, c)))

    collection.push({ card, quantity })
    return card
  }

  private buildBoards<T>(boards: any, callback: (cardMap: Record<string, CardDboAndQuantity>) => T):
    Record<'mainboard' | 'sideboard' | 'commanders' | 'companions' | 'signatureSpells', T> {

    return {
      mainboard: callback(boards.mainboard ?? []),
      sideboard: callback(boards.sideboard ?? []),
      commanders: callback(boards.commanders ?? []),
      companions: callback(boards.companions ?? []),
      signatureSpells: callback(boards.signatureSpells ?? []),
    }
  }

  private extractCardNamesAndQuantities(obj: Record<string, CardDboAndQuantity>): CardNameAndQuantity[] {
    return Object.values(obj).map(card => ({
      name: card.card.name,
      quantity: card.quantity
    }));
  }

  private extractLegalityCardAndQuantities(obj: Record<string, CardDboAndQuantity>): LegalityBoard {
    return {
      count: Object.values(obj).reduce((acc, card) => acc + card.quantity, 0),
      cards: Object.values(obj).map(card => ({
        quantity: card.quantity,
        card: {
          name: card.card.name,
          legalities: card.card.legalities,
          colorIdentity: card.card.colorIdentity
        }
      }))
    }
  }
}
