import type { ResolvedDeckBoards, ResolvedDeckCard, ResolvedDeckDbo } from "~/resources/domain/mappers/deck.mapper"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { resolveEnumValue } from "~/resources/utils/enum"
import type { CardDbo } from "~/resources/domain/dbos/card.dbo"

type BoardName = keyof ResolvedDeckBoards
type IncludedBoard = BoardName
type ExcludedBoard = `-${BoardName}`
type BoardSelector = "all" | (IncludedBoard | ExcludedBoard)[]

export enum GroupBy {
  TYPE = "type",
  SUBTYPE = "subType",
  COLOR = "color",
  COLOR_IDENTITY = "colorIdentity",
  MV = "manaValue",
  CATEGORY = "category",
  NONE = "none"
}

export enum CardCategory {
  PERMANENT = "permanent",
  SPELL = "spell",
  OTHER = "other"
}

export enum CardTypes { // the order is the display order
  PLANESWALKER = "Planeswalker",
  CREATURE = "Creature",
  SORCERY = "Sorcery",
  INSTANT = "Instant",
  ARTIFACT = "Artifact",
  ENCHANTMENT = "Enchantment",
  BATTLE = "Battle",
  LAND = "Land"
}

export type CardFilterOptions = {
  selector?: BoardSelector
  category?: CardCategory
  mv?: string
  types?: CardTypes[]
  supertypes?: string[]
  subtypes?: string[]
  colors?: MTG_COLORS[]
  colorIdentity?: MTG_COLORS[]
  excludeTypes?: CardTypes[]
  excludeSupertypes?: string[]
  excludeSubtypes?: string[]
  excludeColors?: MTG_COLORS[]
  excludeColorIdentity?: MTG_COLORS[]
}

type ManaStatistics = {
  avgWithLands: number
  avgNoLands: number
  medianWithLands: number
  medianNoLands: number
  totalMV: number
  totalCount: number
  totalPips: number
  pips: Map<MTG_COLORS, number>
  production: Map<MTG_COLORS, number>
}

type ManaColor = `${MTG_COLORS}`
type GroupByKeyFor<S extends GroupBy> =
  S extends "none" ? null :
    S extends "color" ? ManaColor :
      S extends "category" ? CardCategory :
        S extends "type" ? CardTypes :
          S extends "mv" ? number :
            never;

type ManaCurveResult<S extends GroupBy> = Map<GroupByKeyFor<S>, { mv: number; qty: number }[]>
type GroupByResult<S extends GroupBy> = Map<GroupByKeyFor<S>, ResolvedDeckCard[]>

const MAX_MANA = 7

export class DeckAnalyzer {
  constructor(private readonly deck: ResolvedDeckDbo) {}

  filterCards(options: CardFilterOptions = {}): ResolvedDeckCard[] {
    const {
      selector = "all",
      mv,
      category,
      types,
      supertypes,
      subtypes,
      excludeTypes,
      excludeSupertypes,
      excludeSubtypes,
      colors,
      excludeColors,
      colorIdentity,
      excludeColorIdentity,
    } = options

    const all = Object.keys(this.deck.boards) as BoardName[]
    let selectedBoards = all
    if (selector !== "all") {
      const includes = new Set(selector.filter(s => !s.startsWith("-")))
      const excludes = new Set(selector.filter(s => s.startsWith("-")).map(s => s.slice(1)))

      selectedBoards =
        includes.size > 0
          ? all.filter(name => includes.has(name) && !excludes.has(name))
          : all.filter(name => !excludes.has(name))
    }

    const mvNum = mv != null ? parseInt(mv) : null
    const isBigMV = mvNum != null && mvNum >= MAX_MANA

    const result: ResolvedDeckCard[] = []

    for (const name of selectedBoards) {
      const board = this.deck.boards[name] ?? []

      for (const entry of board) {
        const card = entry.card

        if (mvNum != null) {
          const value = Math.floor(card.manaValue ?? 0)
          if (isBigMV ? value < MAX_MANA : value !== mvNum) continue
        }

        if (category != null && this.extractCategory(card) !== category) continue

        if (types && !types.some(t => card.types.includes(t))) continue
        if (supertypes && !supertypes.some(t => card.supertypes.includes(t))) continue
        if (subtypes && !subtypes.some(t => card.subtypes.includes(t))) continue

        if (excludeTypes && excludeTypes.some(t => card.types.includes(t))) continue
        if (excludeSupertypes && excludeSupertypes.some(t => card.supertypes.includes(t))) continue
        if (excludeSubtypes && excludeSubtypes.some(t => card.subtypes.includes(t))) continue

        if (colors && !colors.some(c => card.colors?.includes(c))) continue
        if (excludeColors && excludeColors.some(c => card.colors?.includes(c))) continue

        if (colorIdentity && !colorIdentity.some(c => card.colorIdentity?.includes(c))) continue
        if (excludeColorIdentity && excludeColorIdentity.some(c => card.colorIdentity?.includes(c))) continue

        result.push(entry)
      }
    }

    return result
  }

  groupBy<S extends GroupBy>(options: CardFilterOptions & { grouping: S }): GroupByResult<S> {
    const { grouping = GroupBy.NONE, ...filters } = options
    const cards = this.filterCards(filters)
    const groups = new Map<string, ResolvedDeckCard[]>()

    for (const entry of cards) {
      const keys = this.extractGroupingKeys(entry, grouping)
      for (const key of keys) {
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(entry)
      }
    }

    if (grouping === GroupBy.TYPE) {
      const sortedGroups = new Map<GroupByKeyFor<GroupBy.TYPE>, ResolvedDeckCard[]>()

      for (const type of Object.values(CardTypes)) {
        if (groups.has(type)) sortedGroups.set(type, groups.get(type)!)
      }

      for (const [type, value] of groups.entries()) {
        if (!sortedGroups.has(type as CardTypes)) sortedGroups.set(type as CardTypes, value)
      }

      return sortedGroups as GroupByResult<S>
    }

    return new Map(
      [...groups.entries()].sort(([a], [b]) => {
        if (a === "Other") return 1
        if (b === "Other") return -1
        return a.localeCompare(b)
      })
    ) as GroupByResult<S>
  }

  count(options: CardFilterOptions = {}): number {
    return this.filterCards(options).reduce((sum, entry) => sum + entry.quantity, 0)
  }

  manaCurve<S extends GroupBy = GroupBy.NONE>(
    options: CardFilterOptions & { grouping?: S } = {}
  ): ManaCurveResult<S> {
    const { grouping, ...filters } = options

    const groups = this.groupBy({ ...filters, grouping })
    const result = new Map<GroupByKeyFor<S>, { mv: number; qty: number }[]>()
    const defaultCurve = Array.from({ length: MAX_MANA + 1 }, (_, mv) => ({ mv, qty: 0 }))
    for (const [key, cards] of groups.entries()) {
      const curve = result.get(key as GroupByKeyFor<S>) ?? defaultCurve.map(entry => ({ ...entry }))

      for (const { card, quantity } of cards) {
        const index = card.manaValue >= MAX_MANA ? MAX_MANA : card.manaValue
        curve[index].qty += quantity
      }

      result.set(key as GroupByKeyFor<S>, curve)
    }

    return result
  }

  analyzeMana(options: CardFilterOptions = {}): ManaStatistics {
    const cards = this.filterCards(options)
    if (cards.length === 0) {
      return {
        avgWithLands: 0,
        avgNoLands: 0,
        medianWithLands: 0,
        medianNoLands: 0,
        totalMV: 0,
        totalCount: 0,
        totalPips: 0,
        production: new Map(),
        pips: new Map()
      }
    }

    const withLands: number[] = []
    const withoutLands: number[] = []
    const pipCounts: Partial<Record<MTG_COLORS, number>> = {}
    const prodCounts: Partial<Record<MTG_COLORS, number>> = {}
    let totalPips = 0
    let total = 0

    for (const { card, quantity } of cards) {
      const mv = card.manaValue ?? 0
      total += mv * quantity
      withLands.push(...Array(quantity).fill(mv))
      if (!card.types.includes("Land")) {
        withoutLands.push(...Array(quantity).fill(mv))
      }

      const pipMap = this.extractPipMap(card.manaCost)
      for (const color of Object.keys(pipMap) as MTG_COLORS[]) {
        const pips = pipMap[color]! * quantity
        pipCounts[color] = (pipCounts[color] ?? 0) + pips
        totalPips += pips
      }

      const production = this.extractManaProduction(card.text)
      for (const color of production) {
        prodCounts[color] = (prodCounts[color] ?? 0) + quantity
      }
    }

    const average = (arr: number[]) => arr.length ? Number((arr.reduce((a, b) => a + b) / arr.length).toFixed(2)) : 0
    const median = (arr: number[]) => {
      if (arr.length === 0) return 0
      const sorted = arr.slice().sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
    }

    const pips = new Map<MTG_COLORS, number>()
    for (const color of Object.values(MTG_COLORS)) {
      pips.set(color, pipCounts[color] ?? 0)
    }
    const production = new Map<MTG_COLORS, number>()
    for (const color of Object.values(MTG_COLORS)) {
      production.set(color, prodCounts[color] ?? 0)
    }

    return {
      avgWithLands: average(withLands),
      avgNoLands: average(withoutLands),
      medianWithLands: median(withLands),
      medianNoLands: median(withoutLands),
      totalMV: Math.round(total),
      totalCount: cards.reduce((sum, { quantity }) => sum + quantity, 0),
      totalPips,
      production,
      pips
    }
  }

  private extractCategory(card: CardDbo): CardCategory {
    if (card.types.includes("Land")) return CardCategory.OTHER
    if (card.types.includes("Instant") || card.types.includes("Sorcery")) return CardCategory.SPELL
    return CardCategory.PERMANENT
  }

  private extractGroupingKeys(entry: ResolvedDeckCard, grouping: GroupBy): string[] {
    const { card } = entry
    switch (grouping) {
      case GroupBy.TYPE: {
        const primary = this.extractPrimaryType(card.types)
        return [primary ?? "Other"]
      }
      case GroupBy.CATEGORY: {
        return [this.extractCategory(card)]
      }
      case GroupBy.SUBTYPE: {
        return card.subtypes?.length ? card.subtypes : ["Other"]
      }
      case GroupBy.COLOR: {
        if (card.types.includes("Land")) return ["Land"]
        return (card.colors ?? []).map(id => resolveEnumValue(MTG_COLORS, id))
      }
      case GroupBy.COLOR_IDENTITY: {
        if (card.types.includes("Land")) return ["Land"]
        return (card.colorIdentity ?? []).map(id => resolveEnumValue(MTG_COLORS, id))
      }
      case GroupBy.MV: {
        return [`Mana Value ${Math.floor(card.manaValue ?? 0)}`]
      }
      case GroupBy.NONE:
        return [null]
      default:
        console.log("Unknown grouping type:", grouping)
        return ["WTF?"]
    }
  }

  private extractPrimaryType(types: string[]): CardTypes | null {
    const typeOrder = [ // the order is the priority order
      CardTypes.LAND,
      CardTypes.PLANESWALKER,
      CardTypes.CREATURE,
      CardTypes.INSTANT,
      CardTypes.SORCERY,
      CardTypes.ENCHANTMENT,
      CardTypes.ARTIFACT,
      CardTypes.BATTLE
    ]
    return typeOrder.find(type => types.includes(type)) ?? null
  }

  extractPipMap(manaCost: string | undefined): Partial<Record<MTG_COLORS, number>> {
    const counts: Partial<Record<MTG_COLORS, number>> = {}
    if (!manaCost) return counts

    const matches = manaCost.match(/\{([WUBRGC])\}/g)
    if (!matches) return counts

    for (const match of matches) {
      const symbol = match[1] as MTG_COLORS
      counts[symbol] = (counts[symbol] ?? 0) + 1
    }

    return counts
  }

  extractManaProduction(text: string | undefined): MTG_COLORS[] {
    if (!text) return []

    const normalized = text.toLowerCase()

    const produces: Set<MTG_COLORS> = new Set()

    // Case 1: Specific symbols: "{T}: Add {G}, {U}, or {R}."
    for (const match of normalized.matchAll(/\{([wubrgc])\}/g)) {
      const symbol = match[1].toUpperCase() as MTG_COLORS
      produces.add(symbol)
    }

    // Case 2: Any color variants
    const anyColorPatterns = [
      "add one mana of any color",
      "add one mana of any type",
      "add five mana in any combination of colors"
    ]

    if (anyColorPatterns.some(pat => normalized.includes(pat))) {
      Object.values(MTG_COLORS).forEach(color => {
        if (color !== MTG_COLORS.COLORLESS) {
          produces.add(color)
        }
      })
    }

    return [...produces]
  }
}
