import { SettingsDao } from "~/resources/storage/settings.dao";
import type { SettingsModel } from "~/resources/domain/models/settings.model";

export default class SettingsService {
  private static instance: SettingsService;
  private dao: SettingsDao;

  private constructor(dao: SettingsDao) {
    this.dao = dao;
  }

  static getInstance(dao: SettingsDao = SettingsDao.getInstance()): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService(dao);
    }
    return SettingsService.instance;
  }

  async get(): Promise<SettingsModel> {
    return this.dao.load();
  }

  async setOne(key: keyof SettingsModel, value: any): Promise<SettingsModel> {
    const settings = await this.get();
    return this.dao.save({ ...settings, [key]: value }).then(() => this.get());
  }

  async setMany(newSettings: Partial<SettingsModel>): Promise<SettingsModel> {
    const settings = await this.get();
    return this.dao.save({ ...settings, ...newSettings }).then(() => this.get());
  }
}
