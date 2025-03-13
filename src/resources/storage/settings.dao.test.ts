import { describe, it, expect, beforeEach, vi } from "vitest";
import { SettingsDao } from "~/resources/storage/settings.dao";
import { DEFAULT_SETTINGS, type SettingsModel } from "~/resources/domain/models/settings.model"

describe("SettingsDao", () => {
  let settingsDao: SettingsDao;

  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
    settingsDao = new SettingsDao(chrome.storage.local); // Inject mock storage
  });

  it("loads settings from storage", async () => {
    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
      scrapTrawlerSettings: {
        moxfieldApiKey: "test-key",
        enableCrossEventIdentification: true,
      }
    }))

    const settings = await settingsDao.load();

    expect(settings).toEqual({
      moxfieldApiKey: "test-key",
      enableCrossEventIdentification: true,
      showWelcome: true,
      version: 1
    });

    expect(vi.mocked(chrome.storage.local.get)).toHaveBeenCalledWith(["scrapTrawlerSettings"]);
  });

  it("returns default settings when no data is found", async () => {
    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
      scrapTrawlerSettings: undefined
    }))

    const settings = await settingsDao.load();

    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it("saves settings to storage", async () => {
    const newSettings: SettingsModel = {
      ...DEFAULT_SETTINGS,
      moxfieldApiKey: "new-saved-key",
    };

    await settingsDao.save(newSettings);

    expect(vi.mocked(chrome.storage.local.set)).toHaveBeenCalledWith({ scrapTrawlerSettings: newSettings });
  });
});
