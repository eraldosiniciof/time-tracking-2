/**
 * STORAGE_DRIVER: 'local' | 'api'
 * Troque para 'api' quando houver backend PostgreSQL.
 */
export const STORAGE_DRIVER: "local" | "api" = "local";
export const API_BASE_URL = "/api/v1";

/**
 * Google AdSense
 * - Script + client: habilita Auto ads (ative no painel AdSense).
 * - slots: IDs das unidades manuais (Anúncios → Por unidade).
 *   Crie 2 unidades Display responsivas e cole os números abaixo.
 */
export const ADSENSE = {
  enabled: true,
  client: "ca-pub-2016906683193740",
  slots: {
    /** Banner em Registros (entre cronógrafo e histórico) */
    records: "",
    /** Banner em Análise (após resumo) */
    analysis: "",
  },
} as const;

/** Versionamento de schema (client-localstorage-schema) */
export const STORAGE_VERSION = "v2";

export const STORAGE_KEYS = {
  categories: `tempo:categories:${STORAGE_VERSION}`,
  entries: `tempo:entries:${STORAGE_VERSION}`,
  settings: `tempo:settings:${STORAGE_VERSION}`,
} as const;

/** Cores padrão One Dark Pro (classic textColors) */
export const DEFAULT_CATEGORIES = [
  { id: "cat-trabalho", name: "Trabalho", color: "#61afef", icon: "briefcase" },
  { id: "cat-estudo", name: "Estudo", color: "#c678dd", icon: "book" },
  { id: "cat-ingles", name: "Inglês", color: "#e5c07b", icon: "globe" },
  { id: "cat-pessoal", name: "Pessoal", color: "#d19a66", icon: "user" },
  { id: "cat-sem", name: "Sem categoria", color: "#5c6370", icon: "inbox" },
] as const;

export const CATEGORY_COLORS = [
  "#61afef", // Blue
  "#c678dd", // Purple
  "#98c379", // Green
  "#e06c75", // Red
  "#d19a66", // Orange
  "#e5c07b", // Yellow
  "#56b6c2", // Cyan
  "#be5046", // Dark red
  "#528bff", // Accent blue
  "#818e9b", // Gray
] as const;
