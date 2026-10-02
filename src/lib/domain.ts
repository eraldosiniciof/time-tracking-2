import type {
  AnalysisFilters,
  Category,
  CategorySummary,
  DaySummary,
  TimeEntry,
} from "../types/domain";
import { CATEGORY_COLORS } from "./config";
import { createRepository } from "./storage/createRepository";
import { entryElapsedMs, uid } from "./time";

const repo = createRepository();

export async function loadInitialData(): Promise<{
  categories: Category[];
  entries: TimeEntry[];
}> {
  // async-parallel: carrega em paralelo
  const [categories, entries] = await Promise.all([
    repo.getCategories(),
    repo.getEntries(),
  ]);
  return { categories, entries };
}

export async function persistCategories(categories: Category[]): Promise<void> {
  await repo.saveCategories(categories);
}

export async function persistEntries(entries: TimeEntry[]): Promise<void> {
  await repo.saveEntries(entries);
}

export function createEntry(
  description: string,
  categoryId: string,
  now = Date.now(),
): TimeEntry {
  return {
    id: uid("entry"),
    description: description.trim(),
    categoryId,
    firstStartedAt: now,
    startedAt: now,
    endedAt: null,
    durationMs: 0,
    status: "running",
    resetCount: 0,
    hiddenFromRecords: false,
  };
}

export function stopEntryInList(entries: TimeEntry[], id: string): TimeEntry[] {
  const now = Date.now();
  return entries.map((e) => {
    if (e.id !== id || e.status !== "running") return e;
    const total = entryElapsedMs(e, now);
    return {
      ...e,
      status: "completed" as const,
      endedAt: now,
      durationMs: total,
    };
  });
}

export function completeRunning(
  entries: TimeEntry[],
  now: number,
  exceptId?: string,
): TimeEntry[] {
  return entries.map((e) => {
    if (e.status !== "running" || e.id === exceptId) return e;
    const total = entryElapsedMs(e, now);
    return {
      ...e,
      status: "completed" as const,
      endedAt: now,
      durationMs: total,
    };
  });
}

export function restartEntryInList(
  entries: TimeEntry[],
  id: string,
): TimeEntry[] {
  const now = Date.now();
  const current = entries.find((e) => e.id === id);
  if (!current) throw new Error("Registro não encontrado");

  // Continua a contagem: mantém o tempo já acumulado
  const accumulated = entryElapsedMs(current, now);

  const restarted = entries.map((e) => {
    if (e.id !== id) return e;
    return {
      ...e,
      firstStartedAt: e.firstStartedAt ?? e.startedAt,
      startedAt: now,
      endedAt: null,
      durationMs: accumulated,
      status: "running" as const,
      resetCount: (e.resetCount || 0) + 1,
    };
  });

  return completeRunning(restarted, now, id);
}

export function buildCategory(
  name: string,
  color: string | undefined,
  existing: Category[],
): Category {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Nome da categoria é obrigatório");

  const exists = existing.some(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) throw new Error("Já existe uma categoria com esse nome");

  const usedColors = new Set(existing.map((c) => c.color));
  const picked =
    color ||
    CATEGORY_COLORS.find((c) => !usedColors.has(c)) ||
    CATEGORY_COLORS[existing.length % CATEGORY_COLORS.length];

  return {
    id: uid("cat"),
    name: trimmed,
    color: picked,
    icon: "tag",
    isDefault: false,
    createdAt: Date.now(),
  };
}

export function filterEntries(
  entries: TimeEntry[],
  filters: AnalysisFilters = {},
): TimeEntry[] {
  const { day, from, to, categoryId, status, query } = filters;

  let fromTs: number | null = null;
  let toTs: number | null = null;

  if (day) {
    const [y, m, d] = day.split("-").map(Number);
    fromTs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    toTs = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
  } else {
    if (from) {
      const [y, m, d] = from.split("-").map(Number);
      fromTs = new Date(y, m - 1, d, 0, 0, 0, 0).getTime();
    }
    if (to) {
      const [y, m, d] = to.split("-").map(Number);
      toTs = new Date(y, m - 1, d, 23, 59, 59, 999).getTime();
    }
  }

  const q = (query || "").trim().toLowerCase();

  return entries.filter((e) => {
    if (categoryId && e.categoryId !== categoryId) return false;
    if (status && e.status !== status) return false;
    if (q && !e.description.toLowerCase().includes(q)) return false;

    const ref = e.firstStartedAt ?? e.startedAt;
    if (fromTs != null && ref < fromTs) return false;
    if (toTs != null && ref > toTs) return false;
    return true;
  });
}

/** Combina iterações (js-combine-iterations) em um único loop. */
export function summarizeEntries(
  filtered: TimeEntry[],
  categoryById: Map<string, Category>,
  now = Date.now(),
): {
  totalMs: number;
  runningCount: number;
  byCategory: CategorySummary[];
  byDay: DaySummary[];
} {
  let totalMs = 0;
  let runningCount = 0;
  const catMap = new Map<string, number>();
  const dayMap = new Map<string, number>();

  for (const e of filtered) {
    const ms = entryElapsedMs(e, now);
    totalMs += ms;
    if (e.status === "running") runningCount += 1;

    catMap.set(e.categoryId, (catMap.get(e.categoryId) || 0) + ms);

    const d = new Date(e.firstStartedAt ?? e.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    dayMap.set(key, (dayMap.get(key) || 0) + ms);
  }

  const byCategory: CategorySummary[] = [];
  for (const [categoryId, ms] of catMap) {
    byCategory.push({
      categoryId,
      category: categoryById.get(categoryId) ?? null,
      totalMs: ms,
    });
  }
  // js-min-max / sort: ordenar por total
  byCategory.sort((a, b) => b.totalMs - a.totalMs);

  const byDay: DaySummary[] = [];
  for (const [day, ms] of dayMap) {
    byDay.push({ day, totalMs: ms });
  }
  byDay.sort((a, b) => (a.day < b.day ? 1 : -1));

  return { totalMs, runningCount, byCategory, byDay };
}

export function dayKeyFromTs(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function formatDayHeading(dayKey: string, now = new Date()): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const todayKey = dayKeyFromTs(now.getTime());
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = dayKeyFromTs(yesterday.getTime());

  if (dayKey === todayKey) return "Hoje";
  if (dayKey === yesterdayKey) return "Ontem";

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export type DayGroup = {
  day: string;
  label: string;
  entries: TimeEntry[];
  totalMs: number;
};

/** Agrupa por dia (mais recente primeiro); entradas já devem vir ordenadas se desejado. */
export function groupEntriesByDay(
  entries: TimeEntry[],
  now = Date.now(),
): DayGroup[] {
  const map = new Map<string, TimeEntry[]>();

  for (const e of entries) {
    const key = dayKeyFromTs(e.firstStartedAt ?? e.startedAt);
    const list = map.get(key);
    if (list) list.push(e);
    else map.set(key, [e]);
  }

  const days = [...map.keys()].sort((a, b) => (a < b ? 1 : -1));
  const ref = new Date(now);

  return days.map((day) => {
    const list = map.get(day)!;
    let totalMs = 0;
    for (const e of list) totalMs += entryElapsedMs(e, now);
    return {
      day,
      label: formatDayHeading(day, ref),
      entries: list,
      totalMs,
    };
  });
}

/** Oculta da tela Registros; mantém na Análise. Sessões em andamento ficam visíveis. */
export function archiveEntriesFromRecords(entries: TimeEntry[]): TimeEntry[] {
  return entries.map((e) =>
    e.status === "running" ? e : { ...e, hiddenFromRecords: true },
  );
}

/** Remove um registro da lista de Registros sem apagar da Análise. */
export function archiveEntryFromRecords(
  entries: TimeEntry[],
  id: string,
): TimeEntry[] {
  return entries.map((e) => {
    if (e.id !== id || e.status === "running") return e;
    return { ...e, hiddenFromRecords: true };
  });
}
