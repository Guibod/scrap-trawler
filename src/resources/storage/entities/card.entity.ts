export const CARD_ENTITY_VERSION = 1;

export enum CardLanguage {
  ENGLISH = "en",
  ANCIENT_GREEK = "grc",
  CHINESE_SIMPLIFIED = "zh_CN",
  CHINESE_TRADITIONAL = "zh_TW",
  FRENCH = "fr",
  GERMAN = "de",
  ITALIAN = "it",
  JAPANESE = "ja",
  KOREAN = "ko",
  PHYREXIAN = "ph",
  PORTUGUESE = "pt_BR",
  RUSSIAN = "ru",
  SPANISH = "es"
}

export type LocalizedNames = { [lang in CardLanguage]?: string }

export class CardAtomic {
  asciiName?: string;
  attractionLights?: number[];
  colorIdentity: string[];
  colorIndicator?: string[];
  colors: string[];
  convertedManaCost: number;
  defense?: string;
  edhrecRank?: number;
  edhrecSaltiness?: number;
  faceConvertedManaCost?: number;
  faceManaValue?: number;
  faceName?: string;
  firstPrinting?: string;
  foreignData?: ForeignData[];
  hand?: string;
  hasAlternativeDeckLimit?: boolean;
  identifiers: Identifiers;
  isFunny?: boolean;
  isReserved?: boolean;
  keywords?: string[];
  layout: string;
  leadershipSkills?: LeadershipSkills;
  legalities: Legalities;
  life?: string;
  loyalty?: string;
  manaCost?: string;
  manaValue: number;
  name: string;
  power?: string;
  printings?: string[];
  purchaseUrls: PurchaseUrls;
  relatedCards: RelatedCards;
  rulings?: Rulings[];
  side?: string;
  subsets?: string[];
  subtypes: string[];
  supertypes: string[];
  text?: string;
  toughness?: string;
  type: string;
  types: string[];
};

export interface CardFaceEntity {
  name: string;
  manaValue?: number;
  type: string;
  types: string[];
  text?: string;
  colors?: string[];
  colorIdentity?: string[];
  side?: "a" | "b";
}

type ExcludedFields = "foreignData" | "relatedCards" | "rulings" | "purchaseUrls";

export default class CardEntity implements Omit<CardAtomic, ExcludedFields> {
  asciiName?: string;
  attractionLights?: number[];
  colorIdentity: string[];
  colorIndicator?: string[];
  colors: string[];
  convertedManaCost: number;
  defense?: string;
  edhrecRank?: number;
  edhrecSaltiness?: number;
  faceConvertedManaCost?: number;
  faceManaValue?: number;
  faceName?: string;
  firstPrinting?: string;
  hand?: string;
  hasAlternativeDeckLimit?: boolean;
  identifiers: Identifiers;
  isFunny?: boolean;
  isReserved?: boolean;
  keywords?: string[];
  layout: string;
  leadershipSkills?: LeadershipSkills;
  legalities: Legalities;
  life?: string;
  loyalty?: string;
  manaCost?: string;
  manaValue: number;
  name: string;
  power?: string;
  printings?: string[];
  side?: string;
  subsets?: string[];
  subtypes: string[];
  supertypes: string[];
  text?: string;
  toughness?: string;
  type: string;
  types: string[];

  // ✅ Add the new property
  faces?: CardFaceEntity[];
  localizedNames: LocalizedNames;

  constructor(card: Omit<CardAtomic, ExcludedFields> & { localizedNames: LocalizedNames, faces?: CardFaceEntity[] }) {
    Object.assign(this, card); // ✅ Copy only the required properties
    this.localizedNames = card.localizedNames; // ✅ Ensure localizedNames is properly set
    this.faces = card.faces;
  }
}


export function isCardEntity(obj: any): obj is CardEntity {
  return (
    isCardAtomic(obj) &&
    typeof (obj as any).localizedNames === 'object' &&
    typeof (obj as any).images === 'object'
  );
}

export function isCardAtomicArray(arr: unknown): arr is CardAtomic[] {
  return Array.isArray(arr) && arr.every(isCardAtomic);
}

export function isCardAtomic(obj: any): obj is CardAtomic {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.colors) &&
    typeof obj.manaValue === 'number' &&
    typeof obj.type === 'string' &&
    typeof obj.legalities === 'object' &&
    typeof obj.identifiers === 'object'
  );
}

export type ForeignData = {
  faceName?: string;
  flavorText?: string;
  identifiers: Identifiers;
  language: string;
  name: string;
  text?: string;
  type?: string;
};

export type Identifiers = {
  abuId?: string;
  cardKingdomEtchedId?: string;
  cardKingdomFoilId?: string;
  cardKingdomId?: string;
  cardsphereId?: string;
  cardsphereFoilId?: string;
  cardtraderId?: string;
  csiId?: string;
  mcmId?: string;
  mcmMetaId?: string;
  miniaturemarketId?: string;
  mtgArenaId?: string;
  mtgjsonFoilVersionId?: string;
  mtgjsonNonFoilVersionId?: string;
  mtgjsonV4Id?: string;
  mtgoFoilId?: string;
  mtgoId?: string;
  multiverseId?: string;
  scgId?: string;
  scryfallId?: string;
  scryfallCardBackId?: string;
  scryfallOracleId?: string;
  scryfallIllustrationId?: string;
  tcgplayerProductId?: string;
  tcgplayerEtchedProductId?: string;
  tntId?: string;
};

export type LeadershipSkills = {
  brawl: boolean;
  commander: boolean;
  oathbreaker: boolean;
};

export type Legalities = {
  alchemy?: string;
  brawl?: string;
  commander?: string;
  duel?: string;
  explorer?: string;
  future?: string;
  gladiator?: string;
  historic?: string;
  historicbrawl?: string;
  legacy?: string;
  modern?: string;
  oathbreaker?: string;
  oldschool?: string;
  pauper?: string;
  paupercommander?: string;
  penny?: string;
  pioneer?: string;
  predh?: string;
  premodern?: string;
  standard?: string;
  standardbrawl?: string;
  timeless?: string;
  vintage?: string;
};

export type PurchaseUrls = {
  cardKingdom?: string;
  cardKingdomEtched?: string;
  cardKingdomFoil?: string;
  cardmarket?: string;
  tcgplayer?: string;
  tcgplayerEtched?: string;
};

export type RelatedCards = {
  reverseRelated?: string[];
  spellbook?: string[];
};

export type Rulings = {
  date: string;
  text: string;
};