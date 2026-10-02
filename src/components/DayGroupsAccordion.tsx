import type { ReactNode } from "react";
import type { DayGroup } from "@/lib/domain";
import { formatDurationHuman } from "@/lib/time";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type Props = {
  groups: DayGroup[];
  className?: string;
  renderGroup: (group: DayGroup) => ReactNode;
};

export function DayGroupsAccordion({ groups, className, renderGroup }: Props) {
  if (groups.length === 0) return null;

  const defaultOpen = [groups[0].day];

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className={className}
    >
      {groups.map((group) => (
        <AccordionItem key={group.day} value={group.day}>
          <AccordionTrigger className="hover:no-underline">
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
              <span className="capitalize font-bold tracking-tight">
                {group.label}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {group.entries.length}{" "}
                {group.entries.length === 1 ? "registro" : "registros"}
              </span>
            </span>
            <span className="mono-num mr-2 text-sm font-semibold text-muted-foreground">
              {formatDurationHuman(group.totalMs)}
            </span>
          </AccordionTrigger>
          <AccordionContent>{renderGroup(group)}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
