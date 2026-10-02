import type { AppSettings, Category, TimeEntry } from "../../types/domain";

/**
 * Contrato do repositório.
 * Drivers: LocalStorageRepository | ApiRepository (PostgreSQL via REST).
 */
export interface TimeTrackingRepository {
  getCategories(): Promise<Category[]>;
  saveCategories(categories: Category[]): Promise<Category[]>;
  getEntries(): Promise<TimeEntry[]>;
  saveEntries(entries: TimeEntry[]): Promise<TimeEntry[]>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<AppSettings>;
}
