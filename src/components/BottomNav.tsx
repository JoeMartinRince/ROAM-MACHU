import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Clapperboard, User, Plus, Bell } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-header.png";
import logoDark from "@/assets/logo-dark.png";
import { cn } from "@/lib/utils";

const LEFT_TABS = [
  { to: "/" as const, icon: Home, label: "Home", slot: 0, shortcut: "G H" },
  { to: "/explore" as const, icon: Compass, label: "Explore", slot: 1, shortcut: "G E" },
];

const RIGHT_TABS = [
  { to: "/reels" as const, icon: Clapperboard, label: "Reels", slot: 3, shortcut: "G R" },
  { to: "/profile" as const, icon: User, label: "Profile", slot: 4, shortcut: "" },
];

const ALL_TABS = [...LEFT_TABS, ...RIGHT_TABS];

export function DesktopSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      aria-label="Desktop navigation"
      className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-[260px] lg:flex-col lg:justify-between lg:border-r lg:border-border lg:bg-card/90 lg:px-5 lg:py-6 lg:backdrop-blur-xl"
    >
      <div>
        <Link
          to="/"
          aria-label="Roam Machu home"
          className="tap-scale inline-flex items-center px-2 py-1"
        >
          <img src={logo} alt="Roam Machu" className="h-9 w-auto object-contain dark:hidden" />
          <img
            src={logoDark}
            alt="Roam Machu"
            className="hidden h-9 w-auto object-contain dark:block"
          />
        </Link>

        <nav aria-label="Main navigation" className="mt-8 flex flex-col gap-1.5">
          {ALL_TABS.map(({ to, icon: Icon, label, shortcut }) => {
            const isActive = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                className={cn(
                  "tap-scale group flex h-11 items-center justify-between rounded-full px-4 text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary font-semibold text-primary-foreground shadow-float"
                    : "font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} strokeWidth={isActive ? 2.3 : 1.9} />
                  <span>{label}</span>
                </span>
                {shortcut && (
                  <kbd
                    className={cn(
                      "rounded-md px-1.5 py-0.5 font-sans text-[11px] font-medium tracking-wider transition-opacity",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {shortcut}
                  </kbd>
                )}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/create"
          className={cn(
            "tap-scale mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-float transition-all hover:bg-primary/90",
            pathname === "/create" && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          <Plus size={20} strokeWidth={2.5} />
          <span>Create</span>
        </Link>
      </div>

      <div className="space-y-3 border-t border-border/70 pt-4">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast("You're all caught up on new roams!")}
          className="tap-scale flex w-full items-center justify-between rounded-2xl border border-border/80 bg-muted/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-3">
            <span className="relative grid size-9 place-items-center rounded-full bg-background text-foreground shadow-2xs dark:bg-card">
              <Bell size={18} />
              <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
            </span>
            <span>Notifications</span>
          </span>
          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
            New
          </span>
        </button>
      </div>
    </aside>
  );
}

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
          "tap-scale relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full py-1.5 text-[11px] transition-colors duration-200",
          isActive
            ? "font-semibold text-primary"
            : "font-medium text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon
          size={19}
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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] mx-auto max-w-md px-4 pb-[calc(var(--safe-bottom)+var(--bottom-nav-offset))] lg:hidden"
    >
      <div className="liquid-glass pointer-events-auto relative rounded-full p-1.5">
        <div className="relative grid h-12 grid-cols-5 items-center">
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
                "liquid-plus tap-scale flex size-11 shrink-0 items-center justify-center rounded-full text-white hover:brightness-105",
                pathname === "/create" &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <Plus size={22} strokeWidth={2.5} className="block" />
            </Link>
          </div>

          {RIGHT_TABS.map(renderTab)}
        </div>
      </div>
    </nav>
  );
}
