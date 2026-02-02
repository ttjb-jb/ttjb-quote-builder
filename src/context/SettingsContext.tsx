// src/context/SettingsContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadElectricityCost, loadHourlyRate, loadServiceCharge } from "../utils/storage";

export interface SettingsState {
  electricityCostE: number; // p/kWh
  hourlyRateH: number; // £/hour
  serviceChargePercent: number; // %
}

type SettingsContextValue = {
  settings: SettingsState;
  refreshSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>({
    electricityCostE: 0,
    hourlyRateH: 0,
    serviceChargePercent: 0
  });

  const refreshSettings = () => {
    setSettings({
      electricityCostE: loadElectricityCost(),
      hourlyRateH: loadHourlyRate(),
      serviceChargePercent: loadServiceCharge()
    });
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  const value = useMemo(() => ({ settings, refreshSettings }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside <SettingsProvider>");
  return ctx;
}
