export enum MTG_BASIC_LANDS {
  FOREST = "Forest",
  ISLAND = "Island",
  MOUNTAIN = "Mountain",
  PLAINS = "Plains",
  SWAMP = "Swamp",
  FOREST_SNOW = "Snow-Covered Forest",
  ISLAND_SNOW = "Snow-Covered Island",
  MOUNTAIN_SNOW = "Snow-Covered Mountain",
  PLAINS_SNOW = "Snow-Covered Plains",
  SWAMP_SNOW = "Snow-Covered Swamp",
  WASTES = "Wastes"
}

const BASIC_LANDS = new Set<string>(
  Object.values(MTG_BASIC_LANDS).map(name => name.toLowerCase())
);

export function isBasicLand(name: string): boolean {
  return BASIC_LANDS.has(name.toLowerCase());
}