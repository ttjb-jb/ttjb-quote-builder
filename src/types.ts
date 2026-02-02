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

export interface ProjectFilament {
  filamentId: string;
  gramsUsedG: number;
  costPerKg: number;
}

export interface Project {
  id: string;

  // ✅ NEW
  quoteNumber: string; // e.g. "Q-0001"

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

  // Service & handling
  serviceChargePercent: number;
  serviceChargeAmount: number;

  totalCost: number;

  filaments: ProjectFilament[];
  createdAt: string; // ISO string
}
