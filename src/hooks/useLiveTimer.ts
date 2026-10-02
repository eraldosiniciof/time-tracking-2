import { useEffect, useRef, type RefObject } from "react";
import type { TimeEntry } from "../types/domain";
import { entryElapsedMs, formatDuration } from "../lib/time";

/**
 * Atualiza o DOM do timer via ref (rerender-use-ref-transient-values)
 * em vez de setState a cada segundo.
 */
export function useLiveTimer(
  entry: TimeEntry | null,
  timeRef: RefObject<HTMLElement | null>,
) {
  const entryRef = useRef(entry);
  entryRef.current = entry;

  useEffect(() => {
    const tick = () => {
      const node = timeRef.current;
      const current = entryRef.current;
      if (!node) return;
      if (!current || current.status !== "running") {
        node.textContent = "00:00";
        return;
      }
      node.textContent = formatDuration(entryElapsedMs(current));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [timeRef, entry?.id, entry?.startedAt, entry?.status]);
}

/**
 * Atualiza duração de itens running na lista sem re-render global.
 */
export function useListTimers(entries: TimeEntry[]) {
  const entriesRef = useRef(entries);
  entriesRef.current = entries;

  const hasRunning = entries.some((e) => e.status === "running");

  useEffect(() => {
    if (!hasRunning) return;

    const tick = () => {
      const now = Date.now();
      const list = entriesRef.current;
      document
        .querySelectorAll<HTMLElement>("[data-entry-time]")
        .forEach((node) => {
          const id = node.dataset.entryTime;
          const entry = list.find((e) => e.id === id);
          if (!entry || entry.status !== "running") return;
          node.textContent = formatDuration(entryElapsedMs(entry, now));
        });
    };

    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [hasRunning]);
}
