import { faker } from "@faker-js/faker"
import type { DeckCardDbo, DeckDbo } from "~/resources/domain/dbos/deck.dbo"
import { DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import type EventModelBuilder from "~/resources/domain/builders/event.builder"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import type { CardName } from "~/resources/storage/entities/event.entity"

export default class DeckBuilder {
  private deck: Partial<DeckDbo> = {}
  private parentBuilder: EventModelBuilder

  constructor(parent: EventModelBuilder) {
    this.parentBuilder = parent
  }

  partial(data: Partial<DeckDbo>) {
    Object.assign(this.deck, data)
    return this
  }

  withId(id: string) {
    this.deck.id = id
    return this
  }

  withUrl(url: string) {
    this.deck.url = url
    return this
  }

  withRowId(rowId: string) {
    this.deck.spreadsheetRowId = rowId
    return this
  }

  withLastUpdated(date: Date | null) {
    this.deck.lastUpdated = date
    return this
  }

  withMainboard(cards: DeckCardDbo[]) {
    this.deck.boards ??= { mainboard: [] }
    this.deck.boards.mainboard = cards
    return this
  }

  withCommanders(cards: DeckCardDbo[]) {
    this.deck.boards ??= { mainboard: [] }
    this.deck.boards.commanders = cards
    return this
  }

  withSideboard(cards: DeckCardDbo[]) {
    this.deck.boards ??= { mainboard: [] }
    this.deck.boards.sideboard = cards
    return this
  }

  withSignatureSpells(cards: DeckCardDbo[]) {
    this.deck.boards ??= { mainboard: [] }
    this.deck.boards.signatureSpells = cards
    return this
  }

  withCompanions(cards: DeckCardDbo[]) {
    this.deck.boards ??= { mainboard: [] }
    this.deck.boards.companions = cards
    return this
  }

  withFace(cardName: CardName | null) {
    this.deck.face = cardName
    return this
  }

  withStatus(status: DeckStatus) {
    this.deck.status = status
    return this
  }

  withFormat(format: MTG_FORMATS) {
    this.deck.format = format
    return this
  }

  withColors(colors: MTG_COLORS[]) {
    this.deck.colors = colors
    return this
  }

  withLegal(legal: boolean) {
    this.deck.legal = legal
    return this
  }

  end() {
    return this.parentBuilder
  }

  private fillMissingFields() {
    this.deck.id ??= faker.string.uuid()
    this.deck.spreadsheetRowId ??= faker.string.uuid()
    this.deck.boards ??= { mainboard: [] }
    this.deck.face ??= null
    this.deck.status ??= DeckStatus.FETCHED
    this.deck.legal ??= true
    this.deck.format ??= MTG_FORMATS.COMMANDER
    this.deck.colors ??= [MTG_COLORS.GREEN]
    this.deck.lastUpdated ??= new Date()
  }

  build(): DeckDbo {
    this.fillMissingFields()
    return this.deck as DeckDbo
  }
}