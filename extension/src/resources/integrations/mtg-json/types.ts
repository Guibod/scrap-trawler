import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

export const MtgJsonFormats : Record<MTG_FORMATS, string> = {
  [MTG_FORMATS.STANDARD]: "commander",
  [MTG_FORMATS.PAUPER]: "pauper",
  [MTG_FORMATS.PIONEER]: "pioneer",
  [MTG_FORMATS.MODERN]: "modern",
  [MTG_FORMATS.LEGACY]: "legacy",
  [MTG_FORMATS.VINTAGE]: "vintage",
  [MTG_FORMATS.COMMANDER]: "commander",
  [MTG_FORMATS.DUEL]: "duel",
  [MTG_FORMATS.OATHBREAKER]: "oathbreaker",
}