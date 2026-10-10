import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Clapperboard, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const LEFT_TABS = [
  { to: "/" as const, icon: Home, label: "Home", slot: 0 },
  { to: "/explore" as const, icon: Compass, label: "Explore", slot: 1 },
];

const RIGHT_TABS = [
  { to: "/reels" as const, icon: Clapperboard, label: "Reels", slot: 3 },
  { to: "/profile" as const, icon: User, label: "Profile", slot: 4 },
];

const ALL_TABS = [...LEFT_TABS, ...RIGHT_TABS];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeTab = ALL_TABS.find((t) =>
    t.to === "/" ? pathname === "/" : pathname.startsWith(t.to),
  );
  const activeSlot = activeTab?.slot ?? -1;

  const renderTab = ({ to, icon: Icon, label, slot }: (typeof ALL_TABS)[number]) => {
    const isActive = activeSlot === slot;
    return (
      <Link
        key={to}
        to={to}
        activeOptions={{ exact: to === "/" }}
        className={cn(
          "tap-scale relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full py-2 text-xs font-medium transition-colors duration-200",
          isActive ? "font-semibold text-primary" : "text-foreground/75 hover:text-foreground",
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
  };

  return (
    <nav
      aria-label="Primary navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] mx-auto max-w-md px-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
    >
      <div className="liquid-glass pointer-events-auto relative rounded-full p-1.5">
        <div className="relative grid grid-cols-5 items-center">
          <span
            aria-hidden="true"
            className="liquid-capsule pointer-events-none absolute inset-y-0 left-0 w-1/5 rounded-full transition-all duration-[230ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `translateX(${Math.max(0, activeSlot) * 100}%)`,
              opacity: activeSlot >= 0 ? 1 : 0,
            }}
          />

          {LEFT_TABS.map(renderTab)}

          <div className="relative z-10 flex items-center justify-center">
            <Link
              to="/create"
              aria-label="Create post"
              className={cn(
                "liquid-plus tap-scale flex size-12 shrink-0 items-center justify-center rounded-full text-white hover:brightness-105",
                pathname === "/create" &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <Plus size={24} strokeWidth={2.5} className="block" />
            </Link>
          </div>

          {RIGHT_TABS.map(renderTab)}
        </div>
      </div>
    </nav>
  );
}
