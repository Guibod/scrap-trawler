import { describe, it, expect } from "vitest";
import { type SettingsModel, DEFAULT_SETTINGS } from "./settings.model";
import { CardLanguage } from "~/resources/storage/entities/card.entity"

describe("SettingsModel", () => {
  it("has the correct default settings", () => {
    expect(DEFAULT_SETTINGS).toMatchObject<SettingsModel>({
      version: expect.any(Number),
      moxfieldApiKey: null,
      enableCrossEventIdentification: expect.any(Boolean),
      showWelcome: true,
      mtgJsonVersion: null,
      searchLanguages: [CardLanguage.ENGLISH]
    });
  });

  it("ensures settings structure is correct", () => {
    const newSettings: Partial<SettingsModel> = {
      version: 2,
      moxfieldApiKey: "my-api-key",
      enableCrossEventIdentification: true,
      showWelcome: false
    };

    expect(newSettings).toMatchObject<Partial<SettingsModel>>({
      version: 2,
      moxfieldApiKey: "my-api-key",
      enableCrossEventIdentification: true,
      showWelcome: false
    });
  });
});
