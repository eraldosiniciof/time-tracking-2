import { useCallback, useMemo, useRef, useState } from "react";
import { PlayIcon } from "lucide-react";
import { toast } from "sonner";
import { CategoryChips } from "@/components/CategoryChips";
import { CategoryModal } from "@/components/CategoryModal";
import { EntryRow } from "@/components/EntryRow";
import { DayGroupsAccordion } from "@/components/DayGroupsAccordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/hooks/useStore";
import { useListTimers, useLiveTimer } from "@/hooks/useLiveTimer";
import { groupEntriesByDay } from "@/lib/domain";
import { cn } from "@/lib/utils";

type Props = {
  onConfirm: (
    message: string,
    onConfirm: () => void,
    confirmLabel?: string,
  ) => void;
};

export function RecordsView({ onConfirm }: Props) {
  const {
    categories,
    recordEntries,
    categoryById,
    runningEntry,
    startEntry,
    stopEntry,
    restartEntry,
    hideFromRecords,
    clearRecordsView,
    addCategory,
    removeCategory,
  } = useStore();

  const [description, setDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("cat-sem");
  const [modalOpen, setModalOpen] = useState(false);

  const timeRef = useRef<HTMLParagraphElement>(null);
  useLiveTimer(runningEntry, timeRef);
  useListTimers(recordEntries);

  const dayGroups = useMemo(
    () => groupEntriesByDay(recordEntries),
    [recordEntries],
  );

  const handleStart = useCallback(async () => {
    try {
      await startEntry(description, selectedCategoryId);
      setDescription("");
      toast.success("Sessão iniciada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Informe uma descrição");
    }
  }, [description, selectedCategoryId, startEntry]);

  const handleStop = useCallback(
    async (id: string) => {
      await stopEntry(id);
      toast.success("Sessão pausada");
    },
    [stopEntry],
  );

  const handleRestart = useCallback(
    async (id: string) => {
      try {
        await restartEntry(id);
        toast.success("Contagem retomada");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível retomar",
        );
      }
    },
    [restartEntry],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const entry = recordEntries.find((e) => e.id === id);
      if (entry?.status === "running") {
        toast.error("Pause a sessão antes de remover do histórico");
        return;
      }
      onConfirm(
        "Remover este registro do histórico? O tempo continua na Análise.",
        () => {
          void hideFromRecords(id).then(() =>
            toast.success("Removido do histórico — mantido na Análise"),
          );
        },
        "Remover",
      );
    },
    [hideFromRecords, onConfirm, recordEntries],
  );

  const handleRemoveCategory = useCallback(
    (id: string) => {
      const cat = categories.find((c) => c.id === id);
      if (!cat) return;
      onConfirm(
        `Remover a categoria “${cat.name}”? Registros existentes passam para Sem categoria.`,
        () => {
          void removeCategory(id)
            .then(() => {
              setSelectedCategoryId((prev) => (prev === id ? "cat-sem" : prev));
              toast.success("Categoria removida");
            })
            .catch((err) =>
              toast.error(
                err instanceof Error ? err.message : "Não foi possível remover",
              ),
            );
        },
        "Remover",
      );
    },
    [categories, removeCategory, onConfirm],
  );

  const handleSaveCategory = useCallback(
    async (name: string, color: string) => {
      try {
        const cat = await addCategory(name, color);
        setSelectedCategoryId(cat.id);
        setModalOpen(false);
        toast.success(`Categoria “${cat.name}” salva`);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Não foi possível salvar",
        );
      }
    },
    [addCategory],
  );

  return (
    <section className="space-y-6" aria-label="Registros">
      <Card className={cn(runningEntry && "border-live")}>
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:gap-6">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <CardTitle className="text-base">Nova sessão</CardTitle>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Label htmlFor="task-description">O que você vai fazer?</Label>
                <Input
                  id="task-description"
                  placeholder="Descrição do que está sendo feito..."
                  autoComplete="off"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleStart();
                  }}
                />
              </div>
              <Button
                type="button"
                size="icon"
                className="shrink-0 bg-live text-live-foreground hover:bg-live/90"
                aria-label="Iniciar"
                title="Iniciar"
                onClick={() => void handleStart()}
              >
                <PlayIcon className="fill-current" />
              </Button>
            </div>

            <CategoryChips
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
              onRemove={handleRemoveCategory}
              onCreate={() => setModalOpen(true)}
            />
          </div>

          <div
            className={cn(
              "flex min-w-0 items-center gap-4 border-t pt-3 lg:w-[min(280px,34%)] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0",
              runningEntry && "text-live",
            )}
            aria-live="polite"
          >
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  runningEntry ? "text-live" : "text-muted-foreground",
                )}
              >
                {runningEntry ? "Em curso" : "Parado"}
              </p>
              <p className="dial-time dial-time-compact mt-1" ref={timeRef}>
                00:00
              </p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {runningEntry
                  ? runningEntry.description
                  : "Nenhuma sessão ativa"}
              </p>
              {runningEntry ? (
                <p className="truncate text-xs text-muted-foreground">
                  {categoryById.get(runningEntry.categoryId)?.name ?? "—"}
                </p>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight">Histórico</h2>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onConfirm(
              "Limpar o histórico desta tela? Os tempos continuam disponíveis na Análise.",
              () => {
                void clearRecordsView().then(() =>
                  toast.success("Histórico limpo — dados mantidos na Análise"),
                );
              },
              "Limpar histórico",
            )
          }
        >
          Limpar histórico
        </Button>
      </div>

      {dayGroups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-muted-foreground">
            Ainda não há sessões. Escreva uma descrição e toque em Iniciar.
          </CardContent>
        </Card>
      ) : (
        <DayGroupsAccordion
          groups={dayGroups}
          renderGroup={(group) => (
            <div>
              {group.entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  category={categoryById.get(entry.categoryId) ?? null}
                  onStop={handleStop}
                  onRestart={handleRestart}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        />
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(name, color) => void handleSaveCategory(name, color)}
      />
    </section>
  );
}
