// src/repo/repo.ts
import type { Filament, Printer, Project } from "../types";
import type { ThemeMode } from "../utils/storage";

import {
  // theme + company
  loadThemeMode,
  saveThemeMode,
  loadCompanyInfo,
  saveCompanyInfo,

  // logo helpers (if you use these separately)
  loadCompanyLogoDataUrl,
  saveCompanyLogoDataUrl,

  // costs + defaults
  loadElectricityCost,
  saveElectricityCost,
  loadHourlyRate,
  saveHourlyRate,
  loadServiceCharge,
  saveServiceCharge,

  // core entities
  loadPrinters,
  savePrinters,
  loadFilaments,
  saveFilaments,
  loadProjects,
  saveProjects,

  // quote counter + migrations/sync
  getNextQuoteNumber,
  syncQuoteCounterFromProjects,

  // reset
  wipeProjectsOnly,

  // backup
  exportBackupJson,
  importBackupJson
} from "../utils/storage";

export const repo = {
  // ---- Theme ----
  loadThemeMode,
  saveThemeMode,

  // ---- Company info ----
  loadCompanyInfo,
  saveCompanyInfo,
  loadCompanyLogoDataUrl,
  saveCompanyLogoDataUrl,

  // ---- Costs ----
  loadElectricityCost,
  saveElectricityCost,
  loadHourlyRate,
  saveHourlyRate,
  loadServiceCharge,
  saveServiceCharge,

  // ---- Printers / Filaments ----
  loadPrinters,
  savePrinters,
  loadFilaments,
  saveFilaments,

  // ---- Projects / Quotes ----
  loadProjects,
  saveProjects,
  getNextQuoteNumber,
  syncQuoteCounterFromProjects,

  // ---- Reset ----
  wipeProjectsOnly,

  // ---- Backup ----
  exportBackupJson,
  importBackupJson
};

// Optional: re-export types if you want pages to import from repo only
export type { Filament, Printer, Project, ThemeMode };