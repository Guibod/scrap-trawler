import { describe, expect, it } from "vitest"
import { CardCategory, CardTypes, DeckAnalyzer, GroupBy } from "./deck.analyzer"
import type { ResolvedDeckDbo } from "~/resources/domain/mappers/deck.mapper"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"
import { DeckSource, DeckStatus } from "~/resources/domain/dbos/deck.dbo"
import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"

const makeCard = (overrides: Partial<CardDbo> = {}): CardDbo => ({
  name: "Test Card",
  types: ["Creature"],
  supertypes: [],
  subtypes: [],
  colors: [],
  colorIdentity: [],
  manaValue: 2,
  localizedNames: undefined,
  legalities: Object.fromEntries(['brawl', 'commander', 'duel', 'future', 'legacy', 'modern', 'oldschool', 'pauper', 'penny', 'pioneer', 'premodern', 'standard', 'vintage'].map(f => [f, "legal"])),
  ...overrides,
})

const basicDeck: ResolvedDeckDbo = {
  archetype: "",
  face: "", lastUpdated: null, source: DeckSource.TEXT, spreadsheetRowId: "row-1",
  id: "test",
  boards: {
    mainboard: [
      { quantity: 2, card: makeCard({ manaValue: 2, colors: ["G"] }) },
      { quantity: 1, card: makeCard({ manaValue: 3, colors: ["U"] }) },
      { quantity: 1, card: makeCard({ manaValue: 1, colors: ["U", "G"] }) },
      { quantity: 1, card: makeCard({ manaValue: 4, types: ["Instant"], colors: ["R"] }) },
    ],
  },
  status: DeckStatus.FETCHED,
  legal: true,
  format: MTG_FORMATS.MODERN,
  colors: [MTG_COLORS.GREEN, MTG_COLORS.RED]
}

describe("DeckAnalyzer", () => {
  const mockDeck: ResolvedDeckDbo = {
    id: "deck-1",
    boards: {
      mainboard: [
        { quantity: 3, card: makeCard({ name: "Snapcaster Mage", types: [CardTypes.CREATURE], colors: [MTG_COLORS.BLUE], manaCost: "{1}{U}" })},
        { quantity: 2, card: makeCard({ name: "Lightning Bolt", types: [CardTypes.INSTANT], colors: [MTG_COLORS.RED], manaCost: "{R}" })},
        { quantity: 1, card: makeCard({name: "Invasion of Zendikar", types: [CardTypes.BATTLE, CardTypes.LAND], colors: [MTG_COLORS.GREEN], manaCost: "{3}{G}" }) },
      ],
      sideboard: [
        { quantity: 2, card: makeCard({name: "Arcane Infusion", types: [CardTypes.INSTANT], colors: [MTG_COLORS.BLUE, MTG_COLORS.RED], manaCost: "{U}{R}" }) },

      ]
    },
    spreadsheetRowId: "row-1",
    lastUpdated: null,
    source: DeckSource.TEXT,
    archetype: null,
    face: null,
    status: DeckStatus.FETCHED,
    legal: true,
    format: MTG_FORMATS.MODERN,
    colors: [MTG_COLORS.GREEN, MTG_COLORS.RED],
  }

  it("groups cards by primary type from the specified board", () => {
    const analyzer = new DeckAnalyzer(mockDeck)
    const grouped = analyzer.groupBy({ grouping: GroupBy.TYPE, selector: ["mainboard"] })

    expect(grouped.keys().toArray()).toEqual(expect.arrayContaining(["Creature", "Instant", "Land"]))
    expect(grouped.get(CardTypes.CREATURE)).toHaveLength(1)
    expect(grouped.get(CardTypes.LAND)).toHaveLength(1)
    expect(grouped.get(CardTypes.BATTLE)).toBeUndefined()
  })

  describe("getTotalCardCount", () => {
    it("returns 6 total cards in mainboard", () => {
      const analyzer = new DeckAnalyzer(mockDeck)
      expect(analyzer.count({ selector: ["mainboard"] })).toBe(6)
    })
    it("returns 8 total cards in mainboard and sideboard", () => {
      const analyzer = new DeckAnalyzer(mockDeck)
      expect(analyzer.count({ selector: ["mainboard", "sideboard"]})).toBe(8)
    })
    it("returns 6 total cards in mainboard and sideboard minus sideboard", () => {
      const analyzer = new DeckAnalyzer(mockDeck)
      expect(analyzer.count({ selector: ["mainboard", "sideboard", "-sideboard"]})).toBe(6)
    })

    it("returns 8 total cards in all", () => {
      const analyzer = new DeckAnalyzer(mockDeck)
      expect(analyzer.count({selector: "all"})).toBe(8)
    })

    it("returns 6 total cards in everything but sideboard", () => {
      const analyzer = new DeckAnalyzer(mockDeck)
      expect(analyzer.count({selector: ["-sideboard"]})).toBe(6)
    })

  })

  describe("getManaCurve", () => {

    const analyzer = new DeckAnalyzer(basicDeck)

    it("should return a single null-keyed mana curve", () => {
      const curve = analyzer.manaCurve({ selector: ["mainboard"], grouping: GroupBy.NONE })
      expect(curve.size).toBe(1)
      expect(curve.get(null)).toEqual([
        { mv: 0, qty: 0 },
        { mv: 1, qty: 1 },
        { mv: 2, qty: 2 },
        { mv: 3, qty: 1 },
        { mv: 4, qty: 1 },
        { mv: 5, qty: 0 },
        { mv: 6, qty: 0 },
        { mv: 7, qty: 0 },
      ])
    })

    it("should split mana curve by card color", () => {
      const curve = analyzer.manaCurve({selector: ["mainboard"], grouping: GroupBy.COLOR})
      expect(curve.get(MTG_COLORS.GREEN)).toEqual([
        { mv: 0, qty: 0 },
        { mv: 1, qty: 1 },
        { mv: 2, qty: 2 },
        { mv: 3, qty: 0 },
        { mv: 4, qty: 0 },
        { mv: 5, qty: 0 },
        { mv: 6, qty: 0 },
        { mv: 7, qty: 0 },
      ])
      expect(curve.get(MTG_COLORS.BLUE)).toEqual([
        { mv: 0, qty: 0 },
        { mv: 1, qty: 1 },
        { mv: 2, qty: 0 },
        { mv: 3, qty: 1 },
        { mv: 4, qty: 0 },
        { mv: 5, qty: 0 },
        { mv: 6, qty: 0 },
        { mv: 7, qty: 0 },
      ])
      expect(curve.get(MTG_COLORS.RED)).toEqual([
        { mv: 0, qty: 0 },
        { mv: 1, qty: 0 },
        { mv: 2, qty: 0 },
        { mv: 3, qty: 0 },
        { mv: 4, qty: 1 },
        { mv: 5, qty: 0 },
        { mv: 6, qty: 0 },
        { mv: 7, qty: 0 },
      ])
    })

    it("should split mana curve by permanent/spell", () => {
      const curve = analyzer.manaCurve({selector: ["mainboard"], grouping: GroupBy.CATEGORY})
      expect(curve.get(CardCategory.PERMANENT)).toEqual([
        { mv: 0, qty: 0 },
        { mv: 1, qty: 1 },
        { mv: 2, qty: 2 },
        { mv: 3, qty: 1 },
        { mv: 4, qty: 0 },
        { mv: 5, qty: 0 },
        { mv: 6, qty: 0 },
        { mv: 7, qty: 0 },
      ])
      expect(curve.get(CardCategory.SPELL)).toEqual([
        { mv: 0, qty: 0 },
        { mv: 1, qty: 0 },
        { mv: 2, qty: 0 },
        { mv: 3, qty: 0 },
        { mv: 4, qty: 1 },
        { mv: 5, qty: 0 },
        { mv: 6, qty: 0 },
        { mv: 7, qty: 0 },
      ])
    })
  })

  describe("groupBy", () => {
    it("should return cards matching category and mana value", () => {
      const cards = [
        { quantity: 1, card: makeCard({ manaValue: 2, types: ["Creature"] }) },
        { quantity: 1, card: makeCard({ manaValue: 3, types: ["Instant"] }) },
        { quantity: 1, card: makeCard({ manaValue: 2, types: ["Artifact"] }) },
      ]
      const analyzer = new DeckAnalyzer({ ...basicDeck, boards: { mainboard: cards } })
      const subset = analyzer.groupBy({ category: CardCategory.PERMANENT, mv: "2", grouping: GroupBy.TYPE })

      expect(subset.size).toBeGreaterThan(0)
      for (const cards of subset.values()) {
        for (const { card } of cards) {
          expect(Math.floor(card.manaValue)).toBe(2)
        }
      }
    })

    it("should return empty map when no cards match", () => {
      const analyzer = new DeckAnalyzer(basicDeck)
      const subset = analyzer.groupBy({category: CardCategory.SPELL, mv: "99", grouping: GroupBy.TYPE})
      expect(subset.size).toBe(0)
    })
  })

  describe("analyzeMana", () => {
    it("returns zero mana for empty input", () => {
      const analyzer = new DeckAnalyzer({ ...basicDeck, boards: { mainboard: [] }})
      const result = analyzer.analyzeMana()
      expect(result).toMatchObject({
        avgWithLands: 0,
        avgNoLands: 0,
        medianWithLands: 0,
        medianNoLands: 0,
        totalMV: 0,
        totalCount: 0,
        totalPips: 0,
        production: new Map(),
        pips: new Map(),
      })
    })

    it("ignores non-land cards", () => {
      const analyzer = new DeckAnalyzer({
        ...basicDeck,
        boards: {
          mainboard: [
            { quantity: 1, card: makeCard({ name: "Dark Ritual", types: ["Instant"], text: "Add {B}{B}{B}", manaCost: "{B}", manaValue: 1 })}
          ]
        }
      })
      const result = analyzer.analyzeMana()
      expect(result).toMatchObject({
        avgWithLands: 1,
        avgNoLands: 1,
        medianWithLands: 1,
        medianNoLands: 1,
        totalMV: 1,
        totalCount: 1,
        totalPips: 1,
        production: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 1,
          "R": 0,
          "G": 0,
          "C": 0,
        })),
        pips: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 1,
          "R": 0,
          "G": 0,
          "C": 0,
        }))
      })
    })

    it("counts single mana production", () => {
      const analyzer = new DeckAnalyzer({
        ...basicDeck,
        boards: {
          mainboard: [
            {quantity: 1, card: makeCard({ name: "Island", types: ["Land"], text: "Tap: Add {U}", manaCost: null, manaValue: 0 })}
          ]
        }
      })
      const result = analyzer.analyzeMana()
      expect(result).toMatchObject({
        avgWithLands: 0,
        avgNoLands: 0,
        medianWithLands: 0,
        medianNoLands: 0,
        totalMV: 0,
        totalCount: 1,
        totalPips: 0,
        production: new Map(Object.entries({
          "W": 0,
          "U": 1,
          "B": 0,
          "R": 0,
          "G": 0,
          "C": 0,
        })),
        pips: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 0,
          "R": 0,
          "G": 0,
          "C": 0,
        }))
      })
    })

    it("counts multiple mana types", () => {
      const analyzer = new DeckAnalyzer({
        ...basicDeck,
        boards: {
          mainboard: [
            {quantity: 1, card: makeCard({name: "Underground River", types: ["Land"], text: "Tap: Add {U} or {B}", manaValue: 0, manaCost: null})}
          ]
        }
      })
      const result = analyzer.analyzeMana()
      expect(result).toMatchObject({
        avgWithLands: 0,
        avgNoLands: 0,
        medianWithLands: 0,
        medianNoLands: 0,
        totalMV: 0,
        totalCount: 1,
        totalPips: 0,
        production: new Map(Object.entries({
          "W": 0,
          "U": 1,
          "B": 1,
          "R": 0,
          "G": 0,
          "C": 0,
        })),
        pips: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 0,
          "R": 0,
          "G": 0,
          "C": 0,
        }))
      })
    })

    it("ignores misleading text", () => {
      const analyzer = new DeckAnalyzer({
        ...basicDeck,
        boards: {
          mainboard: [
            {quantity: 1, card: makeCard({name: "Weird Land", types: ["Land"], text: "This doesn't add mana", manaCost: null, manaValue: 0})}
          ]
        }
      })
      const result = analyzer.analyzeMana()
      expect(result).toMatchObject({
        avgWithLands: 0,
        avgNoLands: 0,
        medianWithLands: 0,
        medianNoLands: 0,
        totalMV: 0,
        totalCount: 1,
        totalPips: 0,
        production: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 0,
          "R": 0,
          "G": 0,
          "C": 0,
        })),
        pips: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 0,
          "R": 0,
          "G": 0,
          "C": 0,
        }))
      })
    })

    it("handles multiple cards", () => {
      const analyzer = new DeckAnalyzer({
        ...basicDeck,
        boards: {
          mainboard: [
            {quantity: 1, card: makeCard({name: "Island", types: ["Land"], text: "Tap: Add {U}", manaCost: null, manaValue: 0})},
            {quantity: 1, card: makeCard({name: "Swamp", types: ["Land"], text: "Tap: Add {B}", manaCost: null, manaValue: 0})},
            {quantity: 1, card: makeCard({name: "City of Brass", types: ["Land"], text: "Add one mana of any color", manaCost: null, manaValue: 0})},
          ]
        }
      })
      const result = analyzer.analyzeMana()
      expect(result).toMatchObject({
        avgWithLands: 0,
        avgNoLands: 0,
        medianWithLands: 0,
        medianNoLands: 0,
        totalMV: 0,
        totalCount: 3,
        totalPips: 0,
        production: new Map(Object.entries({
          "W": 1,
          "U": 2,
          "B": 2,
          "R": 1,
          "G": 1,
          "C": 0,
        })),
        pips: new Map(Object.entries({
          "W": 0,
          "U": 0,
          "B": 0,
          "R": 0,
          "G": 0,
          "C": 0,
        }))
      })
    })
  })
})
