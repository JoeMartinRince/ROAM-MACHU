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
        "flex w-full items-center justify-between gap-2 rounded-[16px] border border-border bg-muted/50 px-3.5 py-2.5",
        className,
      )}
    >
      <span className="text-sm font-medium text-foreground">Appearance</span>
      <div
        role="radiogroup"
        aria-label="Appearance"
        className="grid grid-cols-3 rounded-full border border-border bg-background p-0.5 text-xs font-medium dark:bg-card"
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
                "tap-scale flex items-center justify-center gap-1 rounded-full px-2.5 py-1 transition-colors",
                active
                  ? "bg-primary font-semibold text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={12} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
