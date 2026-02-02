// src/data/repository.ts
import type { Filament, Printer, Project } from "../types";
import type { CompanyInfo, ThemeMode } from "../utils/storage";
import * as storage from "../utils/storage";

/**
 * Repository = a stable API for the rest of the app.
 * Today it uses localStorage (storage.ts).
 * Later we can swap these implementations to cloud with minimal UI changes.
 */

export const repo = {
  // ---- theme ----
  loadThemeMode(): ThemeMode {
    return storage.loadThemeMode();
  },
  saveThemeMode(mode: ThemeMode) {
    storage.saveThemeMode(mode);
  },

  // ---- company ----
  loadCompanyInfo(): CompanyInfo {
    return storage.loadCompanyInfo();
  },
  saveCompanyInfo(info: CompanyInfo) {
    storage.saveCompanyInfo(info);
  },

  // ---- costs ----
  loadElectricityCost(): number {
    return storage.loadElectricityCost();
  },
  saveElectricityCost(v: number) {
    storage.saveElectricityCost(v);
  },

  loadHourlyRate(): number {
    return storage.loadHourlyRate();
  },
  saveHourlyRate(v: number) {
    storage.saveHourlyRate(v);
  },

  loadServiceCharge(): number {
    return storage.loadServiceCharge();
  },
  saveServiceCharge(v: number) {
    storage.saveServiceCharge(v);
  },

  // ---- printers ----
  loadPrinters(): Printer[] {
    return storage.loadPrinters();
  },
  savePrinters(items: Printer[]) {
    storage.savePrinters(items);
  },

  // ---- filaments ----
  loadFilaments(): Filament[] {
    return storage.loadFilaments();
  },
  saveFilaments(items: Filament[]) {
    storage.saveFilaments(items);
  },

  // ---- projects ----
  loadProjects(): Project[] {
    return storage.loadProjects();
  },
  saveProjects(items: Project[]) {
    storage.saveProjects(items);
  },

  getNextQuoteNumber(): string {
    return storage.getNextQuoteNumber();
  },

  syncQuoteCounterFromProjects(projects: Project[]) {
    storage.syncQuoteCounterFromProjects(projects);
  },

  wipeProjectsOnly() {
    storage.wipeProjectsOnly();
  },

  // ---- backup ----
  exportBackupJson(): string {
    return storage.exportBackupJson();
  },
  importBackupJson(json: string) {
    storage.importBackupJson(json);
  }
};