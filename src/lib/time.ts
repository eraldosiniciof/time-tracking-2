export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatDurationHuman(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function entryElapsedMs(
  entry: {
    status: string;
    startedAt: number;
    endedAt: number | null;
    durationMs?: number;
  },
  now = Date.now(),
): number {
  const base = entry.durationMs ?? 0;
  if (entry.status === "running") {
    return Math.max(0, base + (now - entry.startedAt));
  }
  if (entry.endedAt != null && base === 0) {
    // legado: só timestamps, sem durationMs acumulado
    return Math.max(0, entry.endedAt - entry.startedAt);
  }
  return Math.max(0, base);
}

export function toDateInputValue(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateTime(ts: number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
