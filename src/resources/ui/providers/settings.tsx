import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type SettingsModel } from "~resources/domain/models/settings.model";
import { SettingsDao } from "~resources/storage/settings.dao";

interface SettingsContextType {
  settings: SettingsModel | null;
  updateSettings: (newSettings: Partial<SettingsModel>) => Promise<SettingsModel>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export interface SettingsProviderProps {
  children: React.ReactNode;
  dao?: SettingsDao;
}

export const SettingsProvider = (
  { children, dao = new SettingsDao(chrome.storage.local),}: SettingsProviderProps) => {
  const [currentDao, setCurrentDao] = useState(dao)
  const [settings, setSettings] = useState<SettingsModel|null>(null);

  useEffect(() => {
    currentDao.load().then(setSettings);
  }, [currentDao]);

  const updateSettings = async (newSettings: Partial<SettingsModel>) => {
    const updated = { ...settings, ...newSettings };

    await currentDao.save(updated);
    setSettings(updated);
    return updated
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to access settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
