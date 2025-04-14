import { describe, it, expect } from 'vitest'
import { MTG_FORMATS } from '~/resources/domain/enums/mtg/formats.dbo'
import { checkLegality, type LegalityBoards } from "~/resources/integrations/mtg-json/legality"

const makeCard = (name: string, quantity = 1, legal = 'legal', colors: string[] = []): any => ({
  quantity,
  card: {
    name,
    legalities: {
      commander: legal,
      modern: legal
    },
    colorIdentity: colors
  }
})

describe('checkLegality', () => {
  it('accepts a valid commander deck', () => {
    const deck: LegalityBoards = {
      mainboard: {
        count: 99,
        cards: Array(99).fill(null).map((_, index) => makeCard(`Card ${index}`))
      },
      commanders: {
        count: 1,
        cards: [makeCard('Commander', 1, 'legal', ['G'])]
      }
    }

    expect(checkLegality(deck, MTG_FORMATS.COMMANDER)).toBe(true)
  })

  it('fails if too many copies in commander format', () => {
    const deck: LegalityBoards = {
      mainboard: {
        count: 99,
        cards: [makeCard('Duplicated Card', 2)]
      },
      commanders: {
        count: 1,
        cards: [makeCard('Commander', 1, 'legal')]
      }
    }

    expect(checkLegality(deck, MTG_FORMATS.COMMANDER)).toBe(false)
  })

  it('fails if commander color identity mismatch', () => {
    const deck: LegalityBoards = {
      mainboard: {
        count: 99,
        cards: [makeCard('Red Card', 1, 'legal', ['R'])]
      },
      commanders: {
        count: 1,
        cards: [makeCard('Blue Commander', 1, 'legal', ['U'])]
      }
    }

    expect(checkLegality(deck, MTG_FORMATS.COMMANDER)).toBe(false)
  })

  it('accepts a valid modern deck', () => {
    const deck: LegalityBoards = {
      mainboard: {
        count: 60,
        cards: Array(60).fill(makeCard('Legal Modern Card'))
      },
      sideboard: {
        count: 15,
        cards: Array(15).fill(makeCard('Sideboard Card'))
      }
    }

    expect(checkLegality(deck, MTG_FORMATS.MODERN)).toBe(true)
  })

  it('fails if sideboard is too big in modern', () => {
    const deck: LegalityBoards = {
      mainboard: {
        count: 60,
        cards: Array(60).fill(makeCard('Legal Modern Card'))
      },
      sideboard: {
        count: 16,
        cards: Array(16).fill(makeCard('Sideboard Card'))
      }
    }

    expect(checkLegality(deck, MTG_FORMATS.MODERN)).toBe(false)
  })
})
