import { useMemo, useState } from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import type { DateRange as DayPickerRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DATE_PRESETS,
  formatRangeLabel,
  matchPreset,
  resolvePreset,
  type DateRange,
} from "@/lib/datePresets";
import { toDateInputValue } from "@/lib/time";
import { cn } from "@/lib/utils";

type Props = {
  from?: string;
  to?: string;
  label?: string;
  onChange: (range: DateRange | null) => void;
};

function parseYmd(value?: string): Date | undefined {
  if (!value) return undefined;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

export function DatePeriodPicker({ from, to, label, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selected = useMemo<DayPickerRange | undefined>(() => {
    const start = parseYmd(from);
    const end = parseYmd(to);
    if (!start && !end) return undefined;
    return { from: start, to: end };
  }, [from, to]);

  const activePreset = matchPreset(from, to);
  const chipLabel = formatRangeLabel(from, to, label);
  const hasValue = Boolean(from || to);

  const applyRange = (range: DateRange | null) => {
    onChange(range);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="inline-flex items-center">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={hasValue ? "secondary" : "outline"}
            className={cn(
              "rounded-full",
              !hasValue && "border-dashed text-muted-foreground",
            )}
          >
            <CalendarIcon />
            {chipLabel}
            {!hasValue ? <span aria-hidden>+</span> : null}
          </Button>
        </PopoverTrigger>
        {hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="-ml-1 rounded-full"
            aria-label="Limpar período"
            onClick={() => applyRange(null)}
          >
            <XIcon />
          </Button>
        ) : null}
      </div>

      <PopoverContent
        align="start"
        className="w-auto max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex flex-col md:flex-row">
          <aside className="flex flex-row flex-wrap gap-1 border-b p-3 md:w-44 md:flex-col md:border-r md:border-b-0">
            {DATE_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant={activePreset === preset.id ? "secondary" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => applyRange(resolvePreset(preset.id))}
              >
                {preset.label}
              </Button>
            ))}
          </aside>

          <div className="p-3">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={selected}
              onSelect={(range) => {
                if (!range?.from) return;
                if (!range.to) {
                  // aguarda segundo clique
                  return;
                }
                applyRange({
                  from: toDateInputValue(range.from),
                  to: toDateInputValue(range.to),
                });
              }}
              defaultMonth={selected?.from}
            />
            <p className="px-1 pt-2 text-xs text-muted-foreground">
              Escolha um atalho ou um intervalo no calendário
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
