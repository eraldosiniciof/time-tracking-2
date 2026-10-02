import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Category, TimeEntry } from "../types/domain";
import {
  buildCategory,
  completeRunning,
  createEntry,
  loadInitialData,
  persistCategories,
  persistEntries,
  restartEntryInList,
  stopEntryInList,
  archiveEntriesFromRecords,
  archiveEntryFromRecords,
} from "../lib/domain";

type StoreValue = {
  ready: boolean;
  categories: Category[];
  entries: TimeEntry[];
  /** Entradas visíveis na tela Registros */
  recordEntries: TimeEntry[];
  categoryById: Map<string, Category>;
  runningEntry: TimeEntry | null;
  startEntry: (description: string, categoryId: string) => Promise<void>;
  stopEntry: (id: string) => Promise<void>;
  restartEntry: (id: string) => Promise<void>;
  /** Exclusão permanente (só Análise) */
  deleteEntry: (id: string) => Promise<void>;
  /** Remove da lista de Registros; mantém na Análise */
  hideFromRecords: (id: string) => Promise<void>;
  /** Limpa a lista de Registros sem apagar dados da Análise */
  clearRecordsView: () => Promise<void>;
  addCategory: (name: string, color?: string) => Promise<Category>;
  removeCategory: (id: string) => Promise<void>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadInitialData()
      .then(({ categories: cats, entries: ents }) => {
        if (cancelled) return;
        setCategories(cats);
        setEntries(ents);
        setReady(true);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived during render (rerender-derived-state-no-effect)
  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    for (const c of categories) map.set(c.id, c);
    return map;
  }, [categories]);

  const runningEntry = useMemo(
    () => entries.find((e) => e.status === "running") ?? null,
    [entries],
  );

  const recordEntries = useMemo(
    () => entries.filter((e) => !e.hiddenFromRecords),
    [entries],
  );

  const startEntry = useCallback(async (description: string, categoryId: string) => {
    const trimmed = description.trim();
    if (!trimmed) throw new Error("Descrição é obrigatória");
    if (!categoryId) throw new Error("Selecione uma categoria");

    const now = Date.now();
    const entry = createEntry(trimmed, categoryId, now);

    setEntries((prev) => {
      const next = [entry, ...completeRunning(prev, now)];
      void persistEntries(next);
      return next;
    });
  }, []);

  const stopEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = stopEntryInList(prev, id);
      void persistEntries(next);
      return next;
    });
  }, []);

  const restartEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = restartEntryInList(prev, id);
      void persistEntries(next);
      return next;
    });
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      void persistEntries(next);
      return next;
    });
  }, []);

  const hideFromRecords = useCallback(async (id: string) => {
    setEntries((prev) => {
      const next = archiveEntryFromRecords(prev, id);
      void persistEntries(next);
      return next;
    });
  }, []);

  const clearRecordsView = useCallback(async () => {
    setEntries((prev) => {
      const next = archiveEntriesFromRecords(prev);
      void persistEntries(next);
      return next;
    });
  }, []);

  const addCategory = useCallback(async (name: string, color?: string) => {
    const created = buildCategory(name, color, categories);
    const next = [...categories, created];
    setCategories(next);
    await persistCategories(next);
    return created;
  }, [categories]);

  const removeCategory = useCallback(async (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (cat.isDefault) {
      throw new Error("Categorias padrão não podem ser removidas");
    }

    const fallback =
      categories.find((c) => c.id === "cat-sem") ??
      categories.find((c) => c.id !== id);
    if (!fallback) throw new Error("Nenhuma categoria de fallback");

    const nextCategories = categories.filter((c) => c.id !== id);
    setCategories(nextCategories);
    await persistCategories(nextCategories);

    setEntries((ents) => {
      const next = ents.map((e) =>
        e.categoryId === id ? { ...e, categoryId: fallback.id } : e,
      );
      void persistEntries(next);
      return next;
    });
  }, [categories]);

  const value: StoreValue = {
    ready,
    categories,
    entries,
    recordEntries,
    categoryById,
    runningEntry,
    startEntry,
    stopEntry,
    restartEntry,
    deleteEntry,
    hideFromRecords,
    clearRecordsView,
    addCategory,
    removeCategory,
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
