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
  /**
   * Só carrega/exibe anúncio com conteúdo real na tela.
   * Evita violação: ads em telas vazias, loading ou só navegação.
   */
  ready: boolean;
  className?: string;
  format?: "auto" | "autorelaxed" | "fluid" | "rectangle" | "horizontal" | "vertical";
};

let scriptPromise: Promise<void> | null = null;

function loadAdSenseScript(client: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (document.querySelector("script[data-adsense-manual]")) {
    return scriptPromise ?? Promise.resolve();
  }
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.adsenseManual = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Falha ao carregar AdSense"));
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Unidade manual. Sem Auto ads — o script só entra quando `ready` é true.
 */
export function AdSenseUnit({
  slot,
  ready,
  className,
  format = "autorelaxed",
}: Props) {
  const insRef = useRef<HTMLModElement>(null);
  const slotId = ADSENSE.slots[slot];

  useEffect(() => {
    if (!ADSENSE.enabled || !ADSENSE.manualAds || !ready || !slotId) return;

    let cancelled = false;

    void loadAdSenseScript(ADSENSE.client)
      .then(() => {
        if (cancelled) return;
        const el = insRef.current;
        if (!el || el.getAttribute("data-adsbygoogle-status")) return;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch {
          // ad blocker
        }
      })
      .catch(() => {
        /* script bloqueado */
      });

    return () => {
      cancelled = true;
    };
  }, [ready, slotId]);

  if (!ADSENSE.enabled || !ADSENSE.manualAds || !ready || !slotId) return null;

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
