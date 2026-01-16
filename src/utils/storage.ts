/* ------------------ STORAGE KEYS ------------------ */

const ELECTRICITY_COST_KEY = "electricityCost";
const HOURLY_RATE_KEY = "hourlyRate";
const PRINTERS_KEY = "printers";
const FILAMENTS_KEY = "filaments";

/* ------------------ ELECTRICITY ------------------ */

export function loadElectricityCost(): number {
  const value = localStorage.getItem(ELECTRICITY_COST_KEY);
  return value ? Number(value) : 0;
}

export function saveElectricityCost(value: number) {
  localStorage.setItem(ELECTRICITY_COST_KEY, String(value));
}

/* ------------------ LABOUR ------------------ */

export function loadHourlyRate(): number {
  const value = localStorage.getItem(HOURLY_RATE_KEY);
  return value ? Number(value) : 0;
}

export function saveHourlyRate(value: number) {
  localStorage.setItem(HOURLY_RATE_KEY, String(value));
}

/* ------------------ PRINTERS ------------------ */

interface Printer {
  name: string;
  power: number;
}

export function loadPrinters(): Printer[] {
  const value = localStorage.getItem(PRINTERS_KEY);
  return value ? JSON.parse(value) : [];
}

export function savePrinters(printers: Printer[]) {
  localStorage.setItem(PRINTERS_KEY, JSON.stringify(printers));
}

/* ------------------ FILAMENTS ------------------ */

interface Filament {
  name: string;
  cost: number;
}

export function loadFilaments(): Filament[] {
  const value = localStorage.getItem(FILAMENTS_KEY);
  return value ? JSON.parse(value) : [];
}

export function saveFilaments(filaments: Filament[]) {
  localStorage.setItem(FILAMENTS_KEY, JSON.stringify(filaments));
}
