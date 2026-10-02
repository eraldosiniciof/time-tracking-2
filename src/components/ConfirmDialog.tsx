import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmState = {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
} | null;

type DialogProps = {
  state: ConfirmState;
  onCancel: () => void;
};

export function ConfirmDialog({ state, onCancel }: DialogProps) {
  const open = Boolean(state);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Confirmar</DialogTitle>
          <DialogDescription>{state?.message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            autoFocus
            onClick={() => {
              const fn = state?.onConfirm;
              onCancel();
              fn?.();
            }}
          >
            {state?.confirmLabel ?? "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>(null);

  const askConfirm = useCallback(
    (message: string, onConfirm: () => void, confirmLabel = "Confirmar") => {
      setState({ message, onConfirm, confirmLabel });
    },
    [],
  );

  const askDoubleConfirm = useCallback(
    (
      firstMessage: string,
      secondMessage: string,
      onConfirm: () => void,
      labels?: { first?: string; second?: string },
    ) => {
      askConfirm(
        firstMessage,
        () => {
          window.setTimeout(() => {
            askConfirm(
              secondMessage,
              onConfirm,
              labels?.second ?? "Excluir definitivamente",
            );
          }, 0);
        },
        labels?.first ?? "Continuar",
      );
    },
    [askConfirm],
  );

  const cancelConfirm = useCallback(() => setState(null), []);

  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") cancelConfirm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, cancelConfirm]);

  return { confirmState: state, askConfirm, askDoubleConfirm, cancelConfirm };
}
