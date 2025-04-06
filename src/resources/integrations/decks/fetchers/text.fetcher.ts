import AbstractDeckFetcher, { type CardDboBoard } from "~/resources/integrations/decks/fetchers/abstract.fetcher"
import type { DeckFetchRequest, DeckFetchResponse } from "~/resources/integrations/decks/request"
import type SettingsService from "~/resources/domain/services/settings.service"
import type { CardNameAndQuantity, DeckDescription } from "~/resources/storage/entities/event.entity"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import type CardService from "~/resources/domain/services/card.service"
import type EventService from "~/resources/domain/services/event.service"
import { hashStringSHA1 } from "~/resources/utils/crypto"
import type { SpreadsheetRow } from "~/resources/domain/dbos/spreadsheet.dbo"
import { DeckSource } from "~/resources/domain/dbos/deck.dbo"
import { MagicVilleFetcher } from "~/resources/integrations/decks/fetchers/magic-ville.fetcher"

export class TextFetcher extends AbstractDeckFetcher<string> {
  constructor(
    settingsService: SettingsService,
    cardService: CardService,
    eventService: EventService
  ) {
    super(settingsService, cardService, eventService)
  }

  public async run(request: DeckFetchRequest): Promise<DeckFetchResponse> {
    const raw = request.row.decklistTxt

    try {
      const deck = await this.parse(raw, request)
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

  public async parse(raw: string, request: DeckFetchRequest): Promise<DeckDescription> {
    this.parseSetup(raw)

    const { name, lines } = this.extractNameAndLines(raw, request)
    const format = request.format

    const parseContext = this.parseLines(lines)

    this.inferCommanders(parseContext, format)

    const archetype = this.computeArchetype(request, parseContext)

    return this.describe({
      id: await TextFetcher.generateId(request.row),
      archetype,
      source: DeckSource.TEXT,
      name,
      format,
    })
  }

  private extractNameAndLines(raw: string, req: DeckFetchRequest): { name: string | null, lines: string[] } {
    const lines = raw.split(/\r?\n/)
    let name: string | null = req.row.archetype ?? null

    if (lines[0] === "About") {
      lines.shift()
      name = lines.shift()?.slice(5) ?? null
    }

    return { name, lines }
  }

  private parseLines(lines: string[]): {
    hasCommanderSeparator: boolean
    unsortedFirstLines: number
    lineSinceSeparator: number
    currentTarget: keyof CardDboBoard
  } {
    let currentTarget: keyof CardDboBoard = "mainboard"
    let hasCommanderSeparator = false
    let unsortedFirstLines = 0
    let lineSinceSeparator = 0
    let lastCard: string | null = null
    let previousIsBlank = false
    let i = 0

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) {
        previousIsBlank = true
        continue
      }

      if (trimmed.toUpperCase().startsWith("DECK")) {
        currentTarget = "mainboard"
        previousIsBlank = false
        continue
      }

      if (trimmed.toUpperCase().startsWith("SIDEBOARD")) {
        currentTarget = "sideboard"
        previousIsBlank = false
        continue
      }

      if (previousIsBlank) {
        hasCommanderSeparator = true
        previousIsBlank = false
        lineSinceSeparator = 0
      }

      lineSinceSeparator++
      const match = trimmed.match(/^(?:(?<quantity>\d+)\s+)?(?<name>.+?)(?:\s+\(.*)?$/i) as RegExpMatchArray & {
        groups: { quantity?: string; name: string }
      }

      if (!match) continue

      const name = match.groups.name
      const quantity = parseInt(match.groups.quantity ?? "1", 10)

      this.addToBoard({ name, quantity }, currentTarget)

      if (i <= 3 && lastCard && lastCard.localeCompare(name) > 0) {
        unsortedFirstLines = i
      }

      lastCard = name
      i++
    }

    return { hasCommanderSeparator, unsortedFirstLines, lineSinceSeparator, currentTarget }
  }

  private inferCommanders(
    ctx: { hasCommanderSeparator: boolean; unsortedFirstLines: number, lineSinceSeparator: number, currentTarget: keyof CardDboBoard },
    format: MTG_FORMATS
  ): void {
    const { hasCommanderSeparator, unsortedFirstLines, lineSinceSeparator, currentTarget } = ctx

    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL, MTG_FORMATS.OATHBREAKER].includes(format)) {
      if (hasCommanderSeparator) { // mtgo way
        if (lineSinceSeparator <= 2) {
          const candidates = this.boards[currentTarget].splice(this.boards[currentTarget].length - lineSinceSeparator, lineSinceSeparator)
          this.boards.commanders.push(...candidates)
        }
      }

      if (unsortedFirstLines > 0) {
        const candidates = this.boards.mainboard.splice(0, unsortedFirstLines)
        this.boards.commanders.push(...candidates)
      }

      if (format === MTG_FORMATS.OATHBREAKER && this.boards.commanders.length === 2) {
        const [commander, signature] = this.boards.commanders
        this.boards.commanders = [commander]
        this.boards.signatureSpells = [signature]
      }
    }
  }

  private computeArchetype(
    request: DeckFetchRequest,
    ctx: { hasCommanderSeparator: boolean; unsortedFirstLines: number }
  ): string | null {
    if (this.boards.commanders.length === 0) {
      return request.row.archetype ?? null
    }

    const cards = [
      ...this.boards.commanders,
      ...this.boards.signatureSpells,
      ...this.boards.companions,
    ]

    return cards.map(c => c.name).sort().join(" / ")
  }

  static async generateId(row: SpreadsheetRow): Promise<string> {
    const hash = await hashStringSHA1(row.decklistTxt.trim())
    return `text:${hash}`
  }

  async applyThrottle(): Promise<this> {
    return this
  }
}
