import type CardService from "~/resources/domain/services/card.service"
import type { DeckBoardsDbo, DeckCardDbo, DeckDbo } from "~/resources/domain/dbos/deck.dbo"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"

export interface ResolvedDeckCard {
  quantity: number
  card: CardDbo
}

export interface ResolvedDeckBoards {
  mainboard: ResolvedDeckCard[]
  sideboard?: ResolvedDeckCard[]
  commanders?: ResolvedDeckCard[]
  companions?: ResolvedDeckCard[]
  signatureSpells?: ResolvedDeckCard[]
}

export type ResolvedDeckDbo = Omit<DeckDbo, "boards"> & {
  boards: ResolvedDeckBoards
}

export class DeckMapper {
  constructor(private readonly cardService: CardService) {}

  async toResolvedDeck(deck: DeckDbo): Promise<ResolvedDeckDbo> {
    return {
      ...deck,
      boards: await this.toResolvedBoards(deck.boards),
    }
  }

  private async toResolvedBoards(boards: DeckBoardsDbo): Promise<ResolvedDeckBoards> {
    const resolveBoard = async (cards?: DeckCardDbo[]) =>
      cards ? Promise.all(cards.map(c => this.resolveCard(c))) : undefined

    return {
      mainboard: await resolveBoard(boards.mainboard),
      sideboard: await resolveBoard(boards.sideboard),
      commanders: await resolveBoard(boards.commanders),
      companions: await resolveBoard(boards.companions),
      signatureSpells: await resolveBoard(boards.signatureSpells),
    }
  }

  private async resolveCard(entry: DeckCardDbo): Promise<ResolvedDeckCard> {
    const card = await this.cardService.searchCard(entry.name)
    if (!card) throw new Error(`Card not found: ${entry.name}`)
    return { quantity: entry.quantity, card }
  }
}
