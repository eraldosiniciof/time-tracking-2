import type { AppSettings, Category, TimeEntry } from "../../types/domain";
import { API_BASE_URL } from "../config";
import type { TimeTrackingRepository } from "./repository";

/**
 * Driver HTTP para backend PostgreSQL.
 * Ative com STORAGE_DRIVER = 'api' em config.ts.
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export class ApiRepository implements TimeTrackingRepository {
  getCategories(): Promise<Category[]> {
    return request("/categories");
  }

  saveCategories(categories: Category[]): Promise<Category[]> {
    return request("/categories", {
      method: "PUT",
      body: JSON.stringify(categories),
    });
  }

  getEntries(): Promise<TimeEntry[]> {
    return request("/entries");
  }

  saveEntries(entries: TimeEntry[]): Promise<TimeEntry[]> {
    return request("/entries", {
      method: "PUT",
      body: JSON.stringify(entries),
    });
  }

  getSettings(): Promise<AppSettings> {
    return request("/settings");
  }

  saveSettings(settings: AppSettings): Promise<AppSettings> {
    return request("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }
}
