import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, color: string) => void;
};

export function CategoryModal({ open, onClose, onSave }: Props) {
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#61afef");

  useEffect(() => {
    if (!open) return;
    setName("");
    setColor("#61afef");
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent aria-labelledby={titleId}>
        <DialogHeader>
          <DialogTitle id={titleId}>Nova categoria</DialogTitle>
          <DialogDescription>
            Fica salva neste navegador e aparece nas próximas sessões.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="new-category-name">Nome</Label>
            <Input
              id="new-category-name"
              ref={inputRef}
              value={name}
              placeholder="Academia"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSave(name, color);
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-category-color">Cor</Label>
            <Input
              id="new-category-color"
              type="color"
              value={color}
              className="h-10 w-20 cursor-pointer p-1"
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onSave(name, color)}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
