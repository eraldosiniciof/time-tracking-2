import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Theme } from "@/hooks/useTheme";

type Props = {
  theme: Theme;
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      aria-pressed={isDark}
      title={isDark ? "Modo claro" : "Modo escuro"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
