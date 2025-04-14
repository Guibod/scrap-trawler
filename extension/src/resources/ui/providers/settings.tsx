import React, { createContext, useContext, useEffect, useState } from "react"
import { type SettingsModel } from "~/resources/domain/models/settings.model";
import SettingsService from "~/resources/domain/services/settings.service"
import { addToast } from "@heroui/react"

interface SettingsContextType {
  settings: SettingsModel;
  setOne: (key: keyof SettingsModel, value: any) => Promise<void>;
  setMany: (values: Partial<SettingsModel>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export interface SettingsProviderProps {
  children: React.ReactNode;
  service?: SettingsService
}

export const SettingsProvider = (
  { children, service = SettingsService.getInstance() }: SettingsProviderProps) => {
  const [currentService] = useState(service); // Keep service reference
  const [settings, setSettings] = useState(null); // Store settings

  // Load settings asynchronously on mount
  useEffect(() => {
    const fetchSettings = async () => {
      const loadedSettings = await currentService.get();
      setSettings(loadedSettings);
    };
    fetchSettings();
  }, [currentService]);

  // Wrapper to update settings state after setting new values
  const setOne = (key, value) => {
    return currentService.setOne(key, value)
      .then(setSettings)
      .then(() => addToast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
        color: "success",
      }))
      .catch(() => addToast({
        title: "Error",
        description: "An error occurred while saving settings",
        color: "danger",
      }));
  }

  const setMany = (values: Partial<SettingsModel>) => {
    return currentService.setMany(values)
      .then(setSettings)
      .then(() => addToast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully",
        color: "success",
      }))
      .catch(() => addToast({
        title: "Error",
        description: "An error occurred while saving settings",
        color: "danger",
      }));
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 dark:text-gray-300">Loading settings...</p>
      </div>
    );
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      setMany,
      setOne
    }}>
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
