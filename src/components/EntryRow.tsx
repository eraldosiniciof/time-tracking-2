import { memo } from "react";
import { PauseIcon, PlayIcon, Trash2Icon } from "lucide-react";
import type { Category, TimeEntry } from "@/types/domain";
import { entryElapsedMs, formatDateTime, formatDuration } from "@/lib/time";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  entry: TimeEntry;
  category: Category | null;
  onStop: (id: string) => void;
  onRestart: (id: string) => void;
  onDelete: (id: string) => void;
};

export const EntryRow = memo(function EntryRow({
  entry,
  category,
  onStop,
  onRestart,
  onDelete,
}: Props) {
  const running = entry.status === "running";
  const elapsed = formatDuration(entryElapsedMs(entry));

  return (
    <article
      className={
        running
          ? "grid grid-cols-[3px_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1 border-b border-border bg-live/10 px-2 py-2"
          : "grid grid-cols-[3px_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1 border-b border-border px-2 py-2"
      }
    >
      <div
        className="min-h-7 self-stretch rounded-sm"
        style={{ background: category?.color ?? "var(--muted-foreground)" }}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-semibold">{entry.description}</p>
          {running ? (
            <Badge className="shrink-0 bg-live text-live-foreground">
              Em curso
            </Badge>
          ) : null}
          {entry.resetCount > 0 ? (
            <Badge variant="secondary" className="shrink-0">
              {entry.resetCount}×
            </Badge>
          ) : null}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {category?.name ?? "—"}
          <span className="mx-1.5 text-border">·</span>
          {formatDateTime(entry.firstStartedAt ?? entry.startedAt)}
        </p>
      </div>
      <div
        className="mono-num min-w-14 text-right text-sm font-semibold tabular-nums"
        data-entry-time={entry.id}
      >
        {elapsed}
      </div>
      <div className="flex gap-1">
        {running ? (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="Pausar"
            title="Pausar"
            onClick={() => onStop(entry.id)}
          >
            <PauseIcon className="size-3.5 fill-current" />
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            aria-label="Continuar"
            title="Continuar contagem"
            onClick={() => onRestart(entry.id)}
          >
            <PlayIcon className="size-3.5 fill-current" />
          </Button>
        )}
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-8 text-destructive hover:text-destructive"
          aria-label="Excluir"
          title="Excluir"
          onClick={() => onDelete(entry.id)}
        >
          <Trash2Icon className="size-3.5" />
        </Button>
      </div>
    </article>
  );
});
