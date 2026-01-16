import { createContext, useContext, useState } from "react";
import {
  loadElectricityCost,
  loadHourlyRate,
  saveElectricityCost,
  saveHourlyRate
} from "../utils/storage";

interface Settings {
  electricityCost: number;
  hourlyRate: number;
}

const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (s: Settings) => void;
} | null>(null);

/*export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({
    electricityCost: loadElectricityCost(),
    hourlyRate: loadHourlyRate()
  });

  function updateSettings(newSettings: Settings) {
    setSettings(newSettings);
    saveElectricityCost(newSettings.electricityCost);
    saveHourlyRate(newSettings.hourlyRate);
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}*/

/*export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("SettingsContext missing");
  return ctx;
}*/
