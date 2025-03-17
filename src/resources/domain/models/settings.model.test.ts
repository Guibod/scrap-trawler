import { describe, it, expect } from "vitest";
import { type SettingsModel, DEFAULT_SETTINGS } from "./settings.model";

describe("SettingsModel", () => {
  it("has the correct default settings", () => {
    expect(DEFAULT_SETTINGS).toMatchObject<SettingsModel>({
      version: expect.any(Number),
      moxfieldApiKey: null,
      enableCrossEventIdentification: expect.any(Boolean),
      showWelcome: true
    });
  });

  it("ensures settings structure is correct", () => {
    const newSettings: SettingsModel = {
      version: 2,
      moxfieldApiKey: "my-api-key",
      enableCrossEventIdentification: true,
      showWelcome: false
    };

    expect(newSettings).toMatchObject<SettingsModel>({
      version: 2,
      moxfieldApiKey: "my-api-key",
      enableCrossEventIdentification: true,
      showWelcome: false
    });
  });
});
