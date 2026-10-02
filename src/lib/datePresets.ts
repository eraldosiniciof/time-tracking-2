import { pad, toDateInputValue } from "./time";

export type DateRange = {
  from: string;
  to: string;
  label?: string;
};

export type DatePresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last14"
  | "last30"
  | "thisMonth"
  | "lastMonth";

export const DATE_PRESETS: { id: DatePresetId; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "yesterday", label: "Ontem" },
  { id: "last7", label: "Últimos 7 dias" },
  { id: "last14", label: "Últimos 14 dias" },
  { id: "last30", label: "Últimos 30 dias" },
  { id: "thisMonth", label: "Este mês" },
  { id: "lastMonth", label: "Mês passado" },
];

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function resolvePreset(id: DatePresetId, now = new Date()): DateRange {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (id) {
    case "today":
      return {
        from: toDateInputValue(today),
        to: toDateInputValue(today),
        label: "Hoje",
      };
    case "yesterday": {
      const y = addDays(today, -1);
      return {
        from: toDateInputValue(y),
        to: toDateInputValue(y),
        label: "Ontem",
      };
    }
    case "last7":
      return {
        from: toDateInputValue(addDays(today, -6)),
        to: toDateInputValue(today),
        label: "Últimos 7 dias",
      };
    case "last14":
      return {
        from: toDateInputValue(addDays(today, -13)),
        to: toDateInputValue(today),
        label: "Últimos 14 dias",
      };
    case "last30":
      return {
        from: toDateInputValue(addDays(today, -29)),
        to: toDateInputValue(today),
        label: "Últimos 30 dias",
      };
    case "thisMonth":
      return {
        from: toDateInputValue(startOfMonth(today)),
        to: toDateInputValue(endOfMonth(today)),
        label: "Este mês",
      };
    case "lastMonth": {
      const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return {
        from: toDateInputValue(startOfMonth(prev)),
        to: toDateInputValue(endOfMonth(prev)),
        label: "Mês passado",
      };
    }
  }
}

export function formatRangeLabel(from?: string, to?: string, label?: string): string {
  if (label) return label;
  if (!from && !to) return "Data";
  if (from && to && from === to) {
    const [y, m, d] = from.split("-");
    return `${d}/${m}/${y}`;
  }
  if (from && to) {
    const [y1, m1, d1] = from.split("-");
    const [y2, m2, d2] = to.split("-");
    return `${d1}/${m1}/${y1} – ${d2}/${m2}/${y2}`;
  }
  if (from) {
    const [y, m, d] = from.split("-");
    return `De ${d}/${m}/${y}`;
  }
  const [y, m, d] = (to as string).split("-");
  return `Até ${d}/${m}/${y}`;
}

export function matchPreset(from?: string, to?: string): DatePresetId | null {
  if (!from || !to) return null;
  for (const preset of DATE_PRESETS) {
    const range = resolvePreset(preset.id);
    if (range.from === from && range.to === to) return preset.id;
  }
  return null;
}

const WEEKDAYS = ["Do", "Se", "Te", "Qa", "Qi", "Sx", "Sa"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function weekdayLabels(): string[] {
  return WEEKDAYS;
}

export function monthTitle(year: number, monthIndex: number): string {
  return `${MONTHS[monthIndex]} ${year}`;
}

export type CalendarCell = {
  date: string;
  day: number;
  inMonth: boolean;
};

/** grade 6×7 começando no domingo */
export function buildMonthGrid(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(year, monthIndex, 1);
  const startOffset = first.getDay(); // 0 = domingo
  const start = addDays(first, -startOffset);
  const cells: CalendarCell[] = [];

  for (let i = 0; i < 42; i += 1) {
    const d = addDays(start, i);
    cells.push({
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      day: d.getDate(),
      inMonth: d.getMonth() === monthIndex,
    });
  }

  return cells;
}

export function compareDate(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

export function isInRange(date: string, from?: string, to?: string): boolean {
  if (!from || !to) return false;
  const start = from <= to ? from : to;
  const end = from <= to ? to : from;
  return date >= start && date <= end;
}
