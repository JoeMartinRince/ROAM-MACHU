import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Clapperboard, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/" as const, icon: Home, label: "Home" },
  { to: "/explore" as const, icon: Compass, label: "Explore" },
  { to: "/reels" as const, icon: Clapperboard, label: "Reels" },
  { to: "/profile" as const, icon: User, label: "Profile" },
];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeIndex = TABS.findIndex((t) =>
    t.to === "/" ? pathname === "/" : pathname.startsWith(t.to),
  );

  return (
    <nav
      aria-label="Primary navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
    >
      <div className="pointer-events-auto flex items-center gap-3">
        {/* Wide liquid glass pill with 4 tabs */}
        <div className="liquid-glass relative flex-1 rounded-full p-1.5">
          <div className="relative grid grid-cols-4 items-center">
            <span
              aria-hidden="true"
              className="liquid-capsule pointer-events-none absolute inset-y-0 left-0 w-1/4 rounded-full transition-all duration-[230ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
                opacity: activeIndex >= 0 ? 1 : 0,
              }}
            />
            {TABS.map(({ to, icon: Icon, label }, idx) => {
              const isActive = activeIndex === idx;
              return (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === "/" }}
                  className={cn(
                    "tap-scale relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full py-2 text-xs font-medium transition-colors duration-200",
                    isActive
                      ? "font-semibold text-primary"
                      : "text-foreground/75 hover:text-foreground",
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.25 : 1.9}
                    className="transition-transform duration-200"
                  />
                  <span className="leading-tight">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Separate round orange-tinted liquid glass Plus button */}
        <Link
          to="/create"
          aria-label="Create post"
          className={cn(
            "liquid-plus tap-scale grid size-14 shrink-0 place-items-center rounded-full text-white hover:brightness-105",
            pathname === "/create" && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          <Plus size={26} strokeWidth={2.5} />
        </Link>
      </div>
    </nav>
  );
}
