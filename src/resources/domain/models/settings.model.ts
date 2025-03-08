export interface SettingsModel {
  version: number; // Helps track schema evolution
  moxfieldApiKey: string | null;
  enableCrossEventIdentification: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: SettingsModel = {
  version: 1,
  moxfieldApiKey: null,
  enableCrossEventIdentification: false,
};