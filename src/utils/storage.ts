// src/utils/storage.ts
import type { Filament, Printer, Project } from "../types";

/** -----------------------------
 *  Generic helpers
 * ------------------------------*/
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** -----------------------------
 *  Types used by storage
 * ------------------------------*/
export type ThemeMode = "light" | "dark" | "system";

export interface CompanyInfo {
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyLogoDataUrl?: string; // optional; empty string means none
}

/** -----------------------------
 *  Keys (DECLARE ONCE)
 * ------------------------------*/
const KEY_ELECTRICITY_COST = "electricityCostE"; // number
const KEY_HOURLY_RATE = "hourlyRateH"; // number
const KEY_SERVICE_CHARGE = "serviceChargePercent"; // number

const KEY_PRINTERS = "printers"; // Printer[]
const KEY_FILAMENTS = "filaments"; // Filament[]
const KEY_PROJECTS = "projects"; // Project[]

const KEY_THEME_MODE = "themeMode"; // ThemeMode

const KEY_COMPANY_INFO = "companyInfo"; // CompanyInfo
const KEY_COMPANY_LOGO = "companyLogoDataUrl"; // string | null (legacy)

const KEY_QUOTE_COUNTER = "quoteCounter"; // number

/** -----------------------------
 *  Theme mode
 * ------------------------------*/
export function loadThemeMode(): ThemeMode {
  return load<ThemeMode>(KEY_THEME_MODE, "system");
}
export function saveThemeMode(mode: ThemeMode) {
  save(KEY_THEME_MODE, mode);
}

/** -----------------------------
 *  Basic costs
 * ------------------------------*/
export function loadElectricityCost(): number {
  return load<number>(KEY_ELECTRICITY_COST, 0);
}
export function saveElectricityCost(v: number) {
  save(KEY_ELECTRICITY_COST, Number(v) || 0);
}

export function loadHourlyRate(): number {
  return load<number>(KEY_HOURLY_RATE, 0);
}
export function saveHourlyRate(v: number) {
  save(KEY_HOURLY_RATE, Number(v) || 0);
}

export function loadServiceCharge(): number {
  return load<number>(KEY_SERVICE_CHARGE, 0);
}
export function saveServiceCharge(v: number) {
  save(KEY_SERVICE_CHARGE, Number(v) || 0);
}

/** -----------------------------
 *  Printers
 * ------------------------------*/
export function loadPrinters(): Printer[] {
  return load<Printer[]>(KEY_PRINTERS, []);
}
export function savePrinters(printers: Printer[]) {
  save(KEY_PRINTERS, printers ?? []);
}

/** -----------------------------
 *  Filaments
 * ------------------------------*/
export function loadFilaments(): Filament[] {
  return load<Filament[]>(KEY_FILAMENTS, []);
}
export function saveFilaments(filaments: Filament[]) {
  save(KEY_FILAMENTS, filaments ?? []);
}

/** -----------------------------
 *  Projects
 * ------------------------------*/
export function loadProjects(): Project[] {
  return load<Project[]>(KEY_PROJECTS, []);
}
export function saveProjects(projects: Project[]) {
  save(KEY_PROJECTS, projects ?? []);
}

/** -----------------------------
 *  Quote counter
 * ------------------------------*/
function pad4(n: number) {
  return String(n).padStart(4, "0");
}

/**
 * Returns and increments the next number.
 * After wipe/reset, counter becomes 0, so next is Q-0001.
 */
export function getNextQuoteNumber(): string {
  const current = load<number>(KEY_QUOTE_COUNTER, 0);
  const next = current + 1;
  save(KEY_QUOTE_COUNTER, next);
  return `Q-${pad4(next)}`;
}

/**
 * Ensures the counter is >= max quote number already stored.
 * Useful when importing backups or older data.
 */
export function syncQuoteCounterFromProjects() {
  const projects = loadProjects();

  let max = 0;
  for (const p of projects) {
    const q = (p as any).quoteNumber as string | undefined;
    if (!q) continue;

    // accept formats like "Q-0001" or "q-0001"
    const match = q.match(/(\d+)/);
    if (!match) continue;

    const n = Number(match[1]);
    if (!Number.isNaN(n)) max = Math.max(max, n);
  }

  const current = load<number>(KEY_QUOTE_COUNTER, 0);
  if (max > current) save(KEY_QUOTE_COUNTER, max);
}

/** -----------------------------
 *  Company info & logo
 * ------------------------------*/
export function loadCompanyInfo(): CompanyInfo {
  // Prefer consolidated object
  const info = load<CompanyInfo>(KEY_COMPANY_INFO, {});
  // Legacy support: if logo stored separately, merge it in
  const legacyLogo = load<string | null>(KEY_COMPANY_LOGO, null);
  if (!info.companyLogoDataUrl && legacyLogo) {
    info.companyLogoDataUrl = legacyLogo;
  }
  return info;
}

export function saveCompanyInfo(info: CompanyInfo) {
  save(KEY_COMPANY_INFO, info ?? {});
  // keep legacy key in sync for safety
  const logo = info?.companyLogoDataUrl ? String(info.companyLogoDataUrl) : "";
  save(KEY_COMPANY_LOGO, logo || null);
}

export function loadCompanyLogoDataUrl(): string {
  const info = loadCompanyInfo();
  return info.companyLogoDataUrl ?? "";
}
export function saveCompanyLogoDataUrl(dataUrl: string) {
  const info = loadCompanyInfo();
  saveCompanyInfo({ ...info, companyLogoDataUrl: dataUrl || "" });
}
/** -----------------------------
 *  Reset helpers
 * ------------------------------*/
export function wipeProjectsOnly() {
  // remove projects
  localStorage.removeItem(KEY_PROJECTS);

  // reset quote counter so first new quote is Q-0001
  save(KEY_QUOTE_COUNTER, 0);
}

/** -----------------------------
 *  Backup / Restore
 * ------------------------------*/
type BackupBundle = {
  version: number;
  electricityCostE: number;
  hourlyRateH: number;
  serviceChargePercent: number;
  printers: Printer[];
  filaments: Filament[];
  projects: Project[];
  quoteCounter: number;
  themeMode: ThemeMode;
  companyInfo: CompanyInfo;
};

export function exportBackupJson(): string {
  const bundle: BackupBundle = {
    version: 1,
    electricityCostE: loadElectricityCost(),
    hourlyRateH: loadHourlyRate(),
    serviceChargePercent: loadServiceCharge(),
    printers: loadPrinters(),
    filaments: loadFilaments(),
    projects: loadProjects(),
    quoteCounter: load<number>(KEY_QUOTE_COUNTER, 0),
    themeMode: loadThemeMode(),
    companyInfo: loadCompanyInfo()
  };

  return JSON.stringify(bundle, null, 2);
}

export function importBackupJson(jsonText: string) {
  const parsed = JSON.parse(jsonText) as Partial<BackupBundle>;

  // Write each piece safely with fallbacks
  saveElectricityCost(Number(parsed.electricityCostE ?? 0));
  saveHourlyRate(Number(parsed.hourlyRateH ?? 0));
  saveServiceCharge(Number(parsed.serviceChargePercent ?? 0));

  savePrinters((parsed.printers ?? []) as Printer[]);
  saveFilaments((parsed.filaments ?? []) as Filament[]);
  saveProjects((parsed.projects ?? []) as Project[]);

  save(KEY_QUOTE_COUNTER, Number(parsed.quoteCounter ?? 0));
  saveThemeMode((parsed.themeMode ?? "system") as ThemeMode);

  saveCompanyInfo((parsed.companyInfo ?? {}) as CompanyInfo);

  // Ensure counter is consistent with projects too
  syncQuoteCounterFromProjects();
}
