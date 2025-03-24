import { CardLanguage } from "~/resources/storage/entities/card.entity"

export interface SettingsModel {
  version: number; // Helps track schema evolution
  enableCrossEventIdentification: boolean;
  showWelcome: boolean;
  mtgJsonVersion: string | null;
  searchLanguages: CardLanguage[]
}

// Default settings
export const DEFAULT_SETTINGS: SettingsModel = {
  version: 1,
  enableCrossEventIdentification: false,
  showWelcome: true,
  mtgJsonVersion: null,
  searchLanguages: [CardLanguage.ENGLISH]
};