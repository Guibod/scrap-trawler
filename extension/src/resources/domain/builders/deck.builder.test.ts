import { describe, it, expect } from 'vitest'
import { DeckStatus } from '~/resources/domain/dbos/deck.dbo'
import { MTG_FORMATS } from '~/resources/domain/enums/mtg/formats.dbo'
import { MTG_COLORS } from '~/resources/domain/enums/mtg/colors.dbo'
import type { DeckCardDbo } from '~/resources/domain/dbos/deck.dbo'
import DeckBuilder from "~/resources/domain/builders/deck.builder"

const mockParent = { dummy: true } as any
const sampleCard = (name: string): DeckCardDbo => ({ name, quantity: 1 })

describe('DeckBuilder', () => {
  it('builds a deck with all custom values', () => {
    const deck = new DeckBuilder(mockParent)
      .withId('deck-123')
      .withUrl('https://example.com')
      .withRowId('row-456')
      .withLastUpdated(new Date('2023-01-01'))
      .withMainboard([sampleCard('Forest')])
      .withCommanders([sampleCard('Golgari Queen')])
      .withSideboard([sampleCard('Duress')])
      .withSignatureSpells([sampleCard('Oath of Kaya')])
      .withCompanions([sampleCard('Kaheera, the Orphanguard')])
      .withFace('Forest')
      .withStatus(DeckStatus.FETCHED)
      .withFormat(MTG_FORMATS.MODERN)
      .withColors([MTG_COLORS.BLACK, MTG_COLORS.GREEN])
      .withLegal(false)
      .build()

    expect(deck.id).toBe('deck-123')
    expect(deck.url).toBe('https://example.com')
    expect(deck.spreadsheetRowId).toBe('row-456')
    expect(deck.lastUpdated).toEqual(new Date('2023-01-01'))
    expect(deck.face).toBe('Forest')
    expect(deck.status).toBe(DeckStatus.FETCHED)
    expect(deck.format).toBe(MTG_FORMATS.MODERN)
    expect(deck.legal).toBe(false)
    expect(deck.colors).toEqual([MTG_COLORS.BLACK, MTG_COLORS.GREEN])
    expect(deck.boards.mainboard).toHaveLength(1)
    expect(deck.boards.commanders).toHaveLength(1)
    expect(deck.boards.sideboard).toHaveLength(1)
    expect(deck.boards.signatureSpells).toHaveLength(1)
    expect(deck.boards.companions).toHaveLength(1)
  })

  it('fills missing fields with defaults', () => {
    const deck = new DeckBuilder(mockParent).build()
    expect(deck.id).toBeDefined()
    expect(deck.spreadsheetRowId).toBeDefined()
    expect(deck.boards.mainboard).toBeDefined()
    expect(deck.status).toBe(DeckStatus.FETCHED)
    expect(deck.format).toBe(MTG_FORMATS.COMMANDER)
    expect(deck.legal).toBe(true)
    expect(deck.colors).toEqual([MTG_COLORS.GREEN])
    expect(deck.lastUpdated).toBeInstanceOf(Date)
  })
})
