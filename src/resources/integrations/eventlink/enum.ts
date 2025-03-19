import { MTG_FORMATS } from "~/resources/domain/enums/mtg/formats.dbo"

export const EventLinkFormats: Record<string, MTG_FORMATS> = {
  "Commander": MTG_FORMATS.COMMANDER,
  "Modern": MTG_FORMATS.MODERN,
  "Vintage": MTG_FORMATS.VINTAGE,
  "Legacy": MTG_FORMATS.LEGACY,
  "Standard": MTG_FORMATS.STANDARD,
  "Pauper": MTG_FORMATS.PAUPER,
  "Pioneer": MTG_FORMATS.PIONEER
}