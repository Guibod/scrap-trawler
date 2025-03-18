import type CardEntity from "~/resources/storage/entities/card.entity";
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
      subtypes: entity.subtypes,
      manaValue: entity.manaValue,
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
}
