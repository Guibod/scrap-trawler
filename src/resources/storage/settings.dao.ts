import { DEFAULT_SETTINGS, type SettingsModel } from "~/resources/domain/models/settings.model"
import { getLogger } from "~/resources/logging/logger"

const STORAGE_KEY = "scrapTrawlerSettings";

const logger = getLogger("SettingsDao");

export class SettingsDao {
  private storage: chrome.storage.StorageArea
  constructor(storage: chrome.storage.StorageArea) {
    this.storage = storage;
  }

  async save(settings: SettingsModel): Promise<void> {
    logger.info("Saving settings", settings);
    await this.storage.set({ [STORAGE_KEY]: { ...DEFAULT_SETTINGS, ...settings } });
  }

  async load(): Promise<SettingsModel> {
    const data = await this.storage.get([STORAGE_KEY]);
    logger.debug("Recovered settings", data[STORAGE_KEY]);
    return SettingsDao.migrate(data[STORAGE_KEY]);
  }

  // 🛠 Handles version migrations
  public static migrate(data: any): SettingsModel {
    if (!data || typeof data !== "object") {
      logger.debug("No settings found, returning defaults.");
      return DEFAULT_SETTINGS;
    }

    if (data.version === DEFAULT_SETTINGS.version) {
      logger.debug("Settings are up to date.");
      return data;
    }

    logger.info(`Migrating settings from version ${data.version} to ${DEFAULT_SETTINGS.version}`);

    // Ensure new fields are properly initialized
    return {
      ...DEFAULT_SETTINGS,
      ...data, // Merge stored settings while keeping defaults for new fields
    };
  }
}
