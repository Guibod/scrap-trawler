import type CardEntity from "~/resources/storage/entities/card.entity"


export interface CardDbo extends Pick<CardEntity, "name" | "localizedNames" | "colors" | "colorIdentity" | "supertypes" | "types" | "subtypes" | "manaValue" | "manaCost" | "legalities" | "leadershipSkills" | "text"> {
  imageCrop?: string;
  imageLarge?: string;
  imageMedium?: string;
  imageSmall?: string;
}

export interface CardIndexRecord extends Pick<CardEntity, "name" | "localizedNames"> {

}

export function isCardDbo(obj: unknown): obj is CardDbo {
  if (typeof obj !== "object" || obj === null) return false;

  const card = obj as CardDbo;

  return (
    typeof card.name === "string" &&
    typeof card.localizedNames === "object" &&
    Array.isArray(card.colors) &&
    Array.isArray(card.colorIdentity) &&
    Array.isArray(card.supertypes) &&
    Array.isArray(card.types) &&
    Array.isArray(card.subtypes) &&
    typeof card.manaValue === "number" &&
    (card.imageCrop === undefined || typeof card.imageCrop === "string") &&
    (card.imageLarge === undefined || typeof card.imageLarge === "string") &&
    (card.imageMedium === undefined || typeof card.imageMedium === "string") &&
    (card.imageSmall === undefined || typeof card.imageSmall === "string")
  );
}