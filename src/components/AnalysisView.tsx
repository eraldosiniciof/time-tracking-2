import {
  startTransition,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import type { AnalysisFilters, EntryStatus } from "@/types/domain";
import {
  filterEntries,
  groupEntriesByDay,
  summarizeEntries,
} from "@/lib/domain";
import {
  formatDateTime,
  formatDuration,
  formatDurationHuman,
  entryElapsedMs,
} from "@/lib/time";
import { useStore } from "@/hooks/useStore";
import { DatePeriodPicker } from "@/components/DatePeriodPicker";
import { DayGroupsAccordion } from "@/components/DayGroupsAccordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  onDoubleConfirm: (
    firstMessage: string,
    secondMessage: string,
    onConfirm: () => void,
    labels?: { first?: string; second?: string },
  ) => void;
};

const EMPTY_FILTERS: AnalysisFilters = {};

export function AnalysisView({ onDoubleConfirm }: Props) {
  const { entries, categories, categoryById, deleteEntry } = useStore();

  const [draft, setDraft] = useState<AnalysisFilters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<AnalysisFilters>(EMPTY_FILTERS);
  const deferredFilters = useDeferredValue(applied);

  const summary = useMemo(() => {
    const filtered = filterEntries(entries, deferredFilters);
    return {
      filtered,
      ...summarizeEntries(filtered, categoryById),
    };
  }, [entries, deferredFilters, categoryById]);

  const dayGroups = useMemo(
    () => groupEntriesByDay(summary.filtered),
    [summary.filtered],
  );

  const maxCat = useMemo(() => {
    let max = 1;
    for (const row of summary.byCategory) {
      if (row.totalMs > max) max = row.totalMs;
    }
    return max;
  }, [summary.byCategory]);

  const maxDay = useMemo(() => {
    let max = 1;
    for (const row of summary.byDay) {
      if (row.totalMs > max) max = row.totalMs;
    }
    return max;
  }, [summary.byDay]);

  const applyFilters = (next: AnalysisFilters) => {
    setDraft(next);
    startTransition(() => setApplied(next));
  };

  const handleDelete = (id: string, description: string) => {
    onDoubleConfirm(
      `Remover “${description}” da Análise?`,
      "Confirma a exclusão permanente? Esta ação não pode ser desfeita.",
      () => {
        void deleteEntry(id).then(() =>
          toast.success("Registro removido da Análise"),
        );
      },
      { first: "Continuar", second: "Excluir definitivamente" },
    );
  };

  return (
    <section className="space-y-6" aria-label="Análise">
      <div className="flex flex-wrap items-center gap-2">
        <DatePeriodPicker
          from={draft.from}
          to={draft.to}
          label={draft.periodLabel}
          onChange={(range) => {
            applyFilters({
              ...draft,
              day: undefined,
              from: range?.from,
              to: range?.to,
              periodLabel: range?.label,
            });
          }}
        />

        <Select
          value={draft.categoryId ?? "all"}
          onValueChange={(value) =>
            applyFilters({
              ...draft,
              categoryId: value === "all" ? undefined : value,
            })
          }
        >
          <SelectTrigger className="w-[160px] rounded-full">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={draft.status || "all"}
          onValueChange={(value) =>
            applyFilters({
              ...draft,
              status:
                value === "all" ? undefined : (value as EntryStatus),
            })
          }
        >
          <SelectTrigger className="w-[150px] rounded-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="running">Em andamento</SelectItem>
            <SelectItem value="completed">Finalizados</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="search"
          placeholder="Buscar descrição"
          className="w-[200px] rounded-full"
          value={draft.query ?? ""}
          onChange={(e) =>
            applyFilters({
              ...draft,
              query: e.target.value || undefined,
            })
          }
        />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => applyFilters(EMPTY_FILTERS)}
        >
          Limpar
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tempo total
            </CardTitle>
          </CardHeader>
          <CardContent className="mono-num text-2xl font-semibold">
            {formatDurationHuman(summary.totalMs)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Registros
            </CardTitle>
          </CardHeader>
          <CardContent className="mono-num text-2xl font-semibold">
            {summary.filtered.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em andamento
            </CardTitle>
          </CardHeader>
          <CardContent className="mono-num text-2xl font-semibold">
            {summary.runningCount}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Por categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.byCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem dados para este filtro.
              </p>
            ) : (
              summary.byCategory.map((row) => {
                const pct = Math.round((row.totalMs / maxCat) * 100);
                const name = row.category?.name ?? "—";
                const color = row.category?.color ?? "var(--primary)";
                return (
                  <div
                    key={row.categoryId}
                    className="grid grid-cols-[100px_1fr_auto] items-center gap-2"
                  >
                    <span className="truncate text-sm" title={name}>
                      {name}
                    </span>
                    <div className="h-2 overflow-hidden rounded-sm bg-muted">
                      <div
                        className="h-full rounded-sm transition-[width]"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="mono-num text-xs text-muted-foreground">
                      {formatDurationHuman(row.totalMs)}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Por dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.byDay.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sem dados para este filtro.
              </p>
            ) : (
              summary.byDay.map((row) => {
                const pct = Math.round((row.totalMs / maxDay) * 100);
                const [y, m, d] = row.day.split("-");
                return (
                  <div
                    key={row.day}
                    className="grid grid-cols-[100px_1fr_auto] items-center gap-2"
                  >
                    <span className="text-sm">{`${d}/${m}/${y}`}</span>
                    <div className="h-2 overflow-hidden rounded-sm bg-muted">
                      <div
                        className="h-full rounded-sm bg-primary transition-[width]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="mono-num text-xs text-muted-foreground">
                      {formatDurationHuman(row.totalMs)}
                    </span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros por dia</CardTitle>
        </CardHeader>
        <CardContent>
          {dayGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum registro encontrado.
            </p>
          ) : (
            <DayGroupsAccordion
              groups={dayGroups}
              renderGroup={(group) => (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-2 font-semibold">Descrição</th>
                        <th className="py-2 pr-2 font-semibold">Categoria</th>
                        <th className="py-2 pr-2 font-semibold">Início</th>
                        <th className="py-2 pr-2 font-semibold">Duração</th>
                        <th className="py-2 pr-2 font-semibold">Status</th>
                        <th className="py-2 font-semibold">
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.entries.map((e) => {
                        const cat = categoryById.get(e.categoryId);
                        return (
                          <tr key={e.id} className="border-b last:border-0">
                            <td className="py-2 pr-2">{e.description}</td>
                            <td className="py-2 pr-2">{cat?.name ?? "—"}</td>
                            <td className="py-2 pr-2">
                              {formatDateTime(e.firstStartedAt ?? e.startedAt)}
                            </td>
                            <td className="mono-num py-2 pr-2">
                              {formatDuration(entryElapsedMs(e))}
                            </td>
                            <td className="py-2 pr-2">
                              {e.status === "running" ? (
                                <Badge className="bg-live text-live-foreground">
                                  Em andamento
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Finalizado</Badge>
                              )}
                            </td>
                            <td className="py-2 text-right">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="text-destructive hover:text-destructive"
                                aria-label={`Excluir ${e.description}`}
                                onClick={() =>
                                  handleDelete(e.id, e.description)
                                }
                              >
                                <Trash2Icon />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
