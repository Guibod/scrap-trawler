import CardEntity, {
  CardAtomic,
  type CardFaceEntity, CardLanguage,
  type LocalizedNames
} from "~/resources/storage/entities/card.entity"
import type { CardDbo, CardIndexRecord } from "~/resources/domain/dbos/card.dbo"

export class CardMapper {
  /**
   * Convert a CardEntity to a CardDbo for storage.
   */
  static toDbo(entity: CardEntity): CardDbo {
    const encodedName = encodeURIComponent(entity.name);

    return {
      name: entity.name,
      localizedNames: entity.localizedNames,
      colors: entity.colors,
      colorIdentity: entity.colorIdentity,
      supertypes: entity.supertypes,
      types: entity.types,
      text: entity.text,
      manaCost: entity.manaCost,
      subtypes: entity.subtypes,
      manaValue: entity.manaValue,
      legalities: entity.legalities,
      imageCrop: `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=art_crop`,
      imageLarge: `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=large`,
      imageMedium: `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=normal`,
      imageSmall: `https://api.scryfall.com/cards/named?exact=${encodedName}&format=image&version=small`,
    };
  }

  static toIndexRecord(entity: CardEntity): CardIndexRecord {
    return {
      name: entity.name,
      localizedNames: entity.localizedNames,
    };
  }

  static fromAtomicArray(cards: CardAtomic[]): CardEntity {
    const sorted = [...cards].sort((a, b) => (a.side === "a" ? -1 : 1));
    const front = sorted[0];
    const localizedNames: Record<string, string> = {};

    for (const lang of Object.values(CardLanguage)) {
      let localizedName: string | undefined;
      if (lang === CardLanguage.ENGLISH) {
        localizedName = front.name
      } else {
        localizedName = front.foreignData?.find(fd => fd.language === LANGUAGE_MAP[lang])?.name;
      }

      if (localizedName) {
        localizedNames[lang] = localizedName;
      }
    }

    const hasBothFaces = cards.some((c) => c.side === "a") && cards.some((c) => c.side === "b");

    const cardFaces: CardFaceEntity[] | undefined = hasBothFaces
      ? sorted.map((card) => ({
        name: card.faceName ?? card.name,
        manaCost: card.manaCost,
        manaValue: card.faceManaValue,
        type: card.type,
        types: card.types,
        text: card.text,
        colors: card.colors,
        colorIdentity: card.colorIdentity,
        side: card.side as "a" | "b",
      }))
      : undefined;

    return new CardEntity({
      ...front,
      localizedNames,
      faces: cardFaces,
    });
  }
}

const LANGUAGE_MAP: Record<Exclude<CardLanguage, CardLanguage.ENGLISH>, string> = {
  [CardLanguage.ANCIENT_GREEK] : "Ancient Greek",
  [CardLanguage.CHINESE_SIMPLIFIED]: "Chinese Simplified",
  [CardLanguage.CHINESE_TRADITIONAL]: "Chinese Traditional",
  [CardLanguage.FRENCH]: "French",
  [CardLanguage.GERMAN]: "German",
  [CardLanguage.ITALIAN]: "Italian",
  [CardLanguage.JAPANESE]: "Japanese",
  [CardLanguage.KOREAN]: "Korean",
  [CardLanguage.PHYREXIAN]: "Phyrexian", // Custom code for Phyrexian
  [CardLanguage.PORTUGUESE]: "Portuguese (Brazil)",
  [CardLanguage.RUSSIAN]: "Russian",
  [CardLanguage.SPANISH]: "Spanish"
};