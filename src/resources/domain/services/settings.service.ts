import { SettingsDao } from "~/resources/storage/settings.dao"
import type { SettingsModel } from "~/resources/domain/models/settings.model"

export default class SettingsService {
  private dao = SettingsDao.getInstance();

  async get() : Promise<SettingsModel>{
    return this.dao.load();
  }

  async setOne(key: keyof SettingsModel, value: any) : Promise<SettingsModel> {
    const settings = await this.get();
    return this.dao.save({ ...settings, [key]: value }).then(() => this.get())
  }

  async setMany(newSettings: Partial<SettingsModel>) : Promise<SettingsModel> {
    const settings = await this.get();
    return this.dao.save({ ...settings, ...newSettings }).then(() => this.get());
  }
}