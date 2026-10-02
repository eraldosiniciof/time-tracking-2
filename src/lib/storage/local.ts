import type { AppSettings, Category, TimeEntry } from "../../types/domain";
import { DEFAULT_CATEGORIES, STORAGE_KEYS } from "../config";
import { readJson, writeJson, getLocalStorage } from "./cache";
import type { TimeTrackingRepository } from "./repository";

type LegacyTask = {
  id?: number;
  description?: string;
  created_at?: number;
  finalized_at?: number;
  category?: string;
};

function mapLegacyCategory(label = ""): string {
  const text = label.toLowerCase();
  if (text.includes("trabalho")) return "cat-trabalho";
  if (text.includes("estudo")) return "cat-estudo";
  if (
    text.includes("inglês") ||
    text.includes("ingles") ||
    text.includes("idioma")
  ) {
    return "cat-ingles";
  }
  return "cat-sem";
}

function seedCategories(): Category[] {
  const now = Date.now();
  return DEFAULT_CATEGORIES.map((c) => ({
    ...c,
    isDefault: true,
    createdAt: now,
  }));
}

export class LocalStorageRepository implements TimeTrackingRepository {
  async getCategories(): Promise<Category[]> {
    const stored = readJson<Category[] | null>(STORAGE_KEYS.categories, null);
    if (!stored || stored.length === 0) {
      const seeded = seedCategories();
      writeJson(STORAGE_KEYS.categories, seeded);
      return seeded;
    }

    // Mantém categorias padrão alinhadas à paleta Catppuccin atual
    const defaults = new Map<string, (typeof DEFAULT_CATEGORIES)[number]>(
      DEFAULT_CATEGORIES.map((c) => [c.id, c]),
    );
    let dirty = false;
    const synced = stored.map((cat) => {
      const def = defaults.get(cat.id);
      if (!def || !cat.isDefault) return cat;
      if (cat.color === def.color && cat.name === def.name) return cat;
      dirty = true;
      return { ...cat, color: def.color, name: def.name, icon: def.icon };
    });
    if (dirty) writeJson(STORAGE_KEYS.categories, synced);
    return synced;
  }

  async saveCategories(categories: Category[]): Promise<Category[]> {
    writeJson(STORAGE_KEYS.categories, categories);
    return categories;
  }

  async getEntries(): Promise<TimeEntry[]> {
    const current = readJson<TimeEntry[] | null>(STORAGE_KEYS.entries, null);
    if (Array.isArray(current)) {
      return current.map((e) => ({
        ...e,
        firstStartedAt: e.firstStartedAt ?? e.startedAt,
      }));
    }

    const legacyRaw =
      getLocalStorage("@time-tracking") ??
      getLocalStorage("tempo:entries:v1");

    if (!legacyRaw) return [];

    try {
      const legacy = JSON.parse(legacyRaw) as LegacyTask[];
      if (!Array.isArray(legacy) || legacy.length === 0) return [];

      const migrated: TimeEntry[] = legacy.map((item, index) => {
        const startedAt = item.created_at ?? Date.now();
        const endedAt = item.finalized_at ?? null;
        const completed = endedAt != null;
        return {
          id: `legacy-${item.id ?? index + 1}`,
          description: item.description ?? "Sem descrição",
          categoryId: mapLegacyCategory(item.category),
          firstStartedAt: startedAt,
          startedAt,
          endedAt,
          durationMs: completed ? Math.max(0, endedAt - startedAt) : 0,
          status: completed ? "completed" : "running",
          resetCount: 0,
        };
      });

      writeJson(STORAGE_KEYS.entries, migrated);
      return migrated;
    } catch {
      return [];
    }
  }

  async saveEntries(entries: TimeEntry[]): Promise<TimeEntry[]> {
    writeJson(STORAGE_KEYS.entries, entries);
    return entries;
  }

  async getSettings(): Promise<AppSettings> {
    return readJson<AppSettings>(STORAGE_KEYS.settings, { theme: "dark" });
  }

  async saveSettings(settings: AppSettings): Promise<AppSettings> {
    writeJson(STORAGE_KEYS.settings, settings);
    return settings;
  }
}
