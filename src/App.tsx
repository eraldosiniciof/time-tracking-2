import { lazy, Suspense, startTransition, useState } from "react";
import type { AppView } from "@/types/domain";
import { StoreProvider, useStore } from "@/hooks/useStore";
import { RecordsView } from "@/components/RecordsView";
import { AboutPage, PrivacyPage } from "@/components/ContentPages";
import { ConfirmDialog, useConfirm } from "@/components/ConfirmDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

const AnalysisView = lazy(() =>
  import("@/components/AnalysisView").then((m) => ({ default: m.AnalysisView })),
);

function AnalysisFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function AppShell() {
  const { ready } = useStore();
  const [view, setView] = useState<AppView>("records");
  const { confirmState, askConfirm, askDoubleConfirm, cancelConfirm } =
    useConfirm();
  const { theme, toggleTheme } = useTheme();

  if (!ready) {
    return (
      <div className="app-shell">
        <Skeleton className="h-10 w-48" />
        <div className="mt-6">
          <AnalysisFallback />
        </div>
      </div>
    );
  }

  const mainTab =
    view === "records" || view === "analysis" ? view : "records";

  return (
    <div className="app-shell">
      <header className="mb-6 flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Tempo Foco
          </h1>
          <p className="mt-1 text-muted-foreground">
            Cronógrafo pessoal de foco
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Tabs
            value={mainTab}
            onValueChange={(value) => {
              startTransition(() => setView(value as AppView));
            }}
          >
            <TabsList>
              <TabsTrigger
                value="records"
                onMouseEnter={() => {
                  void import("@/components/AnalysisView");
                }}
              >
                Registros
              </TabsTrigger>
              <TabsTrigger
                value="analysis"
                onMouseEnter={() => {
                  void import("@/components/AnalysisView");
                }}
              >
                Análise
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      {view === "records" ? (
        <RecordsView onConfirm={askConfirm} />
      ) : view === "analysis" ? (
        <Suspense fallback={<AnalysisFallback />}>
          <AnalysisView onDoubleConfirm={askDoubleConfirm} />
        </Suspense>
      ) : view === "about" ? (
        <AboutPage />
      ) : (
        <PrivacyPage />
      )}

      <footer className="mt-10 border-t pt-4 text-sm text-muted-foreground">
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => startTransition(() => setView("about"))}
          >
            Sobre
          </Button>
          <span aria-hidden>·</span>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-muted-foreground"
            onClick={() => startTransition(() => setView("privacy"))}
          >
            Privacidade
          </Button>
          <span aria-hidden>·</span>
          <a
            className="underline-offset-4 hover:text-foreground hover:underline"
            href="/sobre.html"
          >
            /sobre.html
          </a>
          <span aria-hidden>·</span>
          <a
            className="underline-offset-4 hover:text-foreground hover:underline"
            href="/privacidade.html"
          >
            /privacidade.html
          </a>
        </nav>
      </footer>

      <Toaster />
      <ConfirmDialog state={confirmState} onCancel={cancelConfirm} />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <TooltipProvider delayDuration={300}>
        <AppShell />
      </TooltipProvider>
    </StoreProvider>
  );
}
