// noinspection ExceptionCaughtLocallyJS

import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"
import { isBasicLand } from "~/resources/domain/enums/mtg/basics.dbo"
import { MtgJsonFormats } from "~/resources/integrations/mtg-json/types"
import type { CardAtomic } from "~/resources/storage/entities/card.entity"
import { MTG_COLORS } from "~/resources/domain/enums/mtg/colors.dbo"
import { resolveEnumValue } from "~/resources/utils/enum"

export type LegalityCard = Pick<CardAtomic, 'name' | 'legalities' | 'colorIdentity'>

export type LegalityCardAndQuantity = {
  quantity: number
  card: LegalityCard
}

export type LegalityBoard = {
  count: number,
  cards: LegalityCardAndQuantity[]
}

export type LegalityBoards = {
  mainboard: LegalityBoard,
  sideboard?: LegalityBoard,
  commanders?: LegalityBoard,
  companions?: LegalityBoard,
  signatureSpells?: LegalityBoard,
}

export function getCommanderIdentity(boards: LegalityBoards): MTG_COLORS[] {
  return boards.commanders.cards.map(card =>
    card.card.colorIdentity.map((v) => resolveEnumValue(
      MTG_COLORS,
      v
    ))
  ).flat()
}

export function matchesCommanderIdentity(boards: LegalityBoards, card: MTG_COLORS[] | string []): boolean {
  if (!card || card.length === 0) {
    return true
  }
  const a: MTG_COLORS[] = getCommanderIdentity(boards)
  const b: MTG_COLORS[] = card.map(c => resolveEnumValue(MTG_COLORS, c))

  return b.every(item => a.includes(item));
}

export function checkLegality(boards: LegalityBoards, format: MTG_FORMATS): boolean {
  if (!format) {
    return true
  }

  try {
    if (!boards.mainboard?.count) throw new Error(`Missing mainboard count`);

    if ([MTG_FORMATS.COMMANDER, MTG_FORMATS.DUEL, MTG_FORMATS.OATHBREAKER].includes(format)) {
      // commander-like formats
      const mainboard = boards.mainboard.cards || {};
      const commanders = boards.commanders?.cards || {};
      const companions = boards.companions?.cards || {};
      const signatureSpells = boards.signatureSpells?.cards || {};
      const allCards: LegalityCardAndQuantity[] = [
        ...Object.values(mainboard) as LegalityCardAndQuantity[],
        ...Object.values(commanders) as LegalityCardAndQuantity[],
        ...Object.values(companions) as LegalityCardAndQuantity[],
        ...Object.values(signatureSpells) as LegalityCardAndQuantity[]
      ];
      const mainCount = allCards.reduce((acc, card) => acc + card.quantity, 0);

      const cardNames = new Set<string>();
      for (const card of Object.values(allCards)) {
        if (!isBasicLand(card.card.name)) {
          if (card.quantity > 1) {
            throw new Error(`Too many copies of ${card.card.name}`);
          }
          if (cardNames.has(card.card.name)) {
            throw new Error(`Duplicate non-basic card: ${card.card.name}`);
          }
          if (!matchesCommanderIdentity(boards, card.card?.colorIdentity)) {
            throw new Error(`Card ${card.card.name} color identity does not match the commanders`);
          }
          cardNames.add(card.card.name);
        }
        if (!isLegalInFormat(card, format)) {
          throw new Error(`Card ${card.card.name} is not legal in ${format}`);
        }
      }

      let expectedCount = 100
      if (format == MTG_FORMATS.OATHBREAKER) {
        if (!boards.signatureSpells?.count || boards.signatureSpells.count < 1) {
          throw new Error(`No signature spells defined`);
        }
        expectedCount = 60;
      }

      if (mainCount != expectedCount) {
        throw new Error(`The deck has ${mainCount} cards, that should be ${expectedCount}.`);
      }

      if (!boards.commanders?.count || boards.commanders.count < 1) {
        throw new Error(`No commanders defined`);
      }

      return true;
    }

    // 60-card format rules
    const allSections: LegalityCardAndQuantity[][] = [
      boards.mainboard?.cards,
      boards.sideboard?.cards,
      boards.companions?.cards,
    ];

    for (const section of allSections) {
      if (!section) continue;
      for (const card of Object.values(section)) {
        if (!isLegalInFormat(card, format)) {
          throw new Error(`Card ${card.card.name} is not legal in ${format}`);
        }
      }
    }

    if (boards.mainboard.count < 60) throw new Error(`Mainboard has less than 60 cards`);
    if ((boards.sideboard?.count ?? 0) > 15) throw new Error(`Sideboard exceeds 15 cards`);

    return true;
  } catch (err) {
    console.warn(`[MoxfieldFetcher] Deck not legal: ${(err as Error).message}`);
    return false;
  }
}

function isLegalInFormat(card: LegalityCardAndQuantity, format: MTG_FORMATS): boolean {
  const legality = card.card.legalities[MtgJsonFormats[format]]

  if (legality === 'not_legal' || legality === 'banned') {
    return false
  }

  if (legality === 'restricted') {
    return card.quantity <= 1
  }

  return legality === 'legal'
}