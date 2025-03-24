import { describe, it, expect, beforeEach, vi } from "vitest";
import { SettingsDao } from "~/resources/storage/settings.dao";
import { DEFAULT_SETTINGS, type SettingsModel } from "~/resources/domain/models/settings.model"
import { EventDao } from "~/resources/storage/event.dao"
import { CardLanguage } from "~/resources/storage/entities/card.entity"

describe("SettingsDao", () => {
  let settingsDao: SettingsDao;

  beforeEach(() => {
    vi.clearAllMocks(); // Reset mocks before each test
    settingsDao = SettingsDao.getInstance(chrome.storage.local); // Inject mock storage
  });

  it('should create a singleton instance', () => {
    const dao1 = SettingsDao.getInstance();
    const dao2 = SettingsDao.getInstance();

    expect(dao1).toBe(dao2); // Singleton check
  });

  it("loads settings from storage", async () => {
    vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
      scrapTrawlerSettings: {
        enableCrossEventIdentification: true,
      }
    }))

    const settings = await settingsDao.load();

    expect(settings).toEqual({
      mtgJsonVersion: null,
      enableCrossEventIdentification: true,
      showWelcome: true,
      version: 1,
      searchLanguages: [CardLanguage.ENGLISH]
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
    };

    await settingsDao.save(newSettings);

    expect(vi.mocked(chrome.storage.local.set)).toHaveBeenCalledWith({ scrapTrawlerSettings: newSettings });
  });
});
