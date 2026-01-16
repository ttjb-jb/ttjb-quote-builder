export interface Printer {
  id: string;
  name: string;
  powerW: number;
}

export interface Filament {
  id: string;
  name: string;
  costPerKg: number;
}

export interface Settings {
  electricityCostE: number; // p/kWh
  hourlyRateH: number; // £/hour
}
export interface ProjectFilament {
  filamentId: string;
  gramsUsedG: number;
  costPerKg: number;
}

export interface Project {
  id: string;
  name: string;

  printerId: string;
  printerPowerW: number;

  runtimeHoursT: number;

  assemblyHoursA: number;
  accessoryCostM: number;
  accessoryNote: string;

  electricityCost: number;
  filamentCost: number;
  assemblyCost: number;
  totalCost: number;

  filaments: ProjectFilament[];
  createdAt: string;
}
export interface Project {
  id: string;
  name: string;

  electricityCost: number;
  filamentCost: number;
  assemblyCost: number;

  totalCost: number;

  serviceChargePercent: number; // ✅ NEW

  accessoryNote?: string;
  createdAt: number;
}

