import { useMemo } from "react";
import { PlusIcon } from "lucide-react";
import type { Category } from "@/types/domain";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Quantas chips ficam na faixa principal; o resto vai para +N */
const VISIBLE_LIMIT = 5;

type Props = {
  categories: Category[];
  selectedId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onCreate: () => void;
};

function CategoryChip({
  cat,
  selected,
  onSelect,
  onRemove,
}: {
  cat: Category;
  selected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <Button
      type="button"
      role="option"
      aria-selected={selected}
      variant={selected ? "secondary" : "outline"}
      size="sm"
      className={cn(
        "max-w-[11rem] shrink-0 rounded-full",
        selected && "ring-2 ring-offset-2 ring-offset-background",
      )}
      style={
        selected
          ? ({
              ["--tw-ring-color" as string]: cat.color,
            } as React.CSSProperties)
          : undefined
      }
      title={
        cat.isDefault
          ? cat.name
          : "Clique para selecionar · duplo clique remove"
      }
      onClick={() => onSelect(cat.id)}
      onDoubleClick={() => {
        if (!cat.isDefault) onRemove(cat.id);
      }}
    >
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: cat.color }}
        aria-hidden
      />
      <span className="truncate">{cat.name}</span>
    </Button>
  );
}

export function CategoryChips({
  categories,
  selectedId,
  onSelect,
  onRemove,
  onCreate,
}: Props) {
  const { visible, overflow } = useMemo(() => {
    if (categories.length <= VISIBLE_LIMIT) {
      return { visible: categories, overflow: [] as Category[] };
    }

    const selected = categories.find((c) => c.id === selectedId);
    const others = categories.filter((c) => c.id !== selectedId);
    const room = selected ? VISIBLE_LIMIT - 1 : VISIBLE_LIMIT;
    const head = others.slice(0, room);
    const rest = others.slice(room);
    const visibleList = selected ? [selected, ...head] : head;

    return { visible: visibleList, overflow: rest };
  }, [categories, selectedId]);

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Categorias
        </p>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-7"
              aria-label="Criar nova categoria"
              onClick={onCreate}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            Criar nova categoria
          </TooltipContent>
        </Tooltip>
      </div>

      <div
        className="flex flex-wrap items-center gap-2"
        role="listbox"
        aria-label="Categorias"
      >
        {visible.map((cat) => (
          <CategoryChip
            key={cat.id}
            cat={cat}
            selected={cat.id === selectedId}
            onSelect={onSelect}
            onRemove={onRemove}
          />
        ))}

        {overflow.length > 0 ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-full text-muted-foreground"
                aria-label={`Mais ${overflow.length} categorias`}
              >
                +{overflow.length}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-2">
              <p className="mb-2 px-1 text-xs font-medium text-muted-foreground">
                Mais categorias
              </p>
              <div
                className="flex max-h-48 flex-col gap-1 overflow-y-auto"
                role="listbox"
                aria-label="Categorias ocultas"
              >
                {overflow.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    role="option"
                    aria-selected={cat.id === selectedId}
                    variant={cat.id === selectedId ? "secondary" : "ghost"}
                    size="sm"
                    className="h-8 justify-start"
                    title={
                      cat.isDefault
                        ? cat.name
                        : "Clique para selecionar · duplo clique remove"
                    }
                    onClick={() => onSelect(cat.id)}
                    onDoubleClick={() => {
                      if (!cat.isDefault) onRemove(cat.id);
                    }}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: cat.color }}
                      aria-hidden
                    />
                    <span className="truncate">{cat.name}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  );
}
