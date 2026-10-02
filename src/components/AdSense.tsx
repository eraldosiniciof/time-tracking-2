import { useEffect, useRef } from "react";
import { ADSENSE } from "@/lib/config";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type SlotKey = keyof typeof ADSENSE.slots;

type Props = {
  slot: SlotKey;
  className?: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
};

/**
 * Unidade Display responsiva. Só renderiza se o slot estiver preenchido em config.
 * Auto ads (script no index.html) funciona mesmo sem estes slots.
 */
export function AdSenseUnit({ slot, className, format = "auto" }: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const slotId = ADSENSE.slots[slot];

  useEffect(() => {
    if (!ADSENSE.enabled || !slotId) return;
    const el = insRef.current;
    if (!el || el.getAttribute("data-adsbygoogle-status")) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blocker / script ainda não carregou
    }
  }, [slotId]);

  if (!ADSENSE.enabled || !slotId) return null;

  return (
    <aside
      className={cn("adsense-slot", className)}
      aria-label="Anúncio"
      data-ad-slot-key={slot}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE.client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
