import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemeMode } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { mode, setThemeMode } = useTheme();

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-card",
        className,
      )}
    >
      <span className="pl-1 text-sm font-semibold text-foreground">Appearance</span>
      <div
        role="radiogroup"
        aria-label="Appearance"
        className="grid grid-cols-3 rounded-full border border-border/70 bg-muted p-1 text-xs font-medium"
      >
        {OPTIONS.map(({ value, label, icon: Icon }) => {
          const active = mode === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setThemeMode(value)}
              className={cn(
                "tap-scale flex items-center justify-center gap-1 rounded-full px-2.5 py-1.5 transition-colors",
                active
                  ? "bg-card font-semibold text-primary shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={13} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
