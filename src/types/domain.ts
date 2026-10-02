export type EntryStatus = "running" | "completed";

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
  createdAt: number;
};

export type TimeEntry = {
  id: string;
  description: string;
  categoryId: string;
  /** Início original (exibição) */
  firstStartedAt: number;
  /** Início do segmento atual (quando running) */
  startedAt: number;
  endedAt: number | null;
  /** Tempo acumulado em segmentos anteriores (ms) */
  durationMs: number;
  status: EntryStatus;
  resetCount: number;
  /**
   * Oculto na tela Registros (após "Limpar"),
   * mas permanece disponível na Análise.
   */
  hiddenFromRecords?: boolean;
};

export type AppSettings = {
  theme: "light" | "dark";
};

export type AnalysisFilters = {
  day?: string;
  from?: string;
  to?: string;
  /** Rótulo amigável do preset (ex.: "Últimos 7 dias") */
  periodLabel?: string;
  categoryId?: string;
  status?: EntryStatus | "";
  query?: string;
};

export type CategorySummary = {
  categoryId: string;
  category: Category | null;
  totalMs: number;
};

export type DaySummary = {
  day: string;
  totalMs: number;
};

export type AppView = "records" | "analysis";
