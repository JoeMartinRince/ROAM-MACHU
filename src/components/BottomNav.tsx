import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Clapperboard, User, Plus, Bell } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-header.png";
import logoDark from "@/assets/logo-dark.png";
import { cn } from "@/lib/utils";

const ALL_TABS = [
  { to: "/" as const, icon: Home, label: "Home", slot: 0, shortcut: "G H" },
  { to: "/explore" as const, icon: Compass, label: "Explore", slot: 1, shortcut: "G E" },
  { to: "/reels" as const, icon: Clapperboard, label: "Reels", slot: 2, shortcut: "G R" },
  { to: "/profile" as const, icon: User, label: "Profile", slot: 3, shortcut: "" },
];

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
                  <Icon size={19} strokeWidth={isActive ? 2.2 : 1.85} />
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
            "tap-scale mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-float transition-all hover:bg-primary/90",
            pathname === "/create" && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          )}
        >
          <Plus size={19} strokeWidth={2.4} />
          <span>Create</span>
        </Link>
      </div>

      <div className="space-y-3 border-t border-border/70 pt-4">
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast("You're all caught up on new roams!")}
          className="tap-scale flex w-full items-center justify-between rounded-xl border border-border/80 bg-muted/60 px-3.5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <span className="flex items-center gap-3">
            <span className="relative grid size-8 place-items-center rounded-full bg-background text-foreground shadow-2xs dark:bg-card">
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            </span>
            <span>Notifications</span>
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
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
  const isReels = pathname.startsWith("/reels");

  return (
    <>
      {!isReels && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-[999] mx-auto h-[120px] max-w-md bg-gradient-to-t from-background via-background/80 to-transparent lg:hidden"
        />
      )}
      <nav
        aria-label="Primary navigation"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] mx-auto max-w-md px-4 pb-[calc(var(--safe-bottom)+var(--bottom-nav-offset))] lg:hidden"
      >
        <div className="flex items-center gap-3">
          <div className="liquid-glass pointer-events-auto relative flex-1 rounded-full p-1.5">
            <div className="relative grid h-12 grid-cols-4 items-center">
              <span
                aria-hidden="true"
                className="liquid-capsule pointer-events-none absolute inset-y-0 left-0 w-1/4 rounded-full transition-all duration-[230ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  transform: `translateX(${Math.max(0, activeSlot) * 100}%)`,
                  opacity: activeSlot >= 0 ? 1 : 0,
                }}
              />

              {ALL_TABS.map(({ to, icon: Icon, label, slot }) => {
                const isActive = activeSlot === slot;
                return (
                  <Link
                    key={to}
                    to={to}
                    activeOptions={{ exact: to === "/" }}
                    className={cn(
                      "tap-scale relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full py-1 text-[11px] transition-colors duration-200",
                      isActive
                        ? "font-semibold text-primary"
                        : "font-medium text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.2 : 1.85}
                      className="transition-transform duration-200"
                    />
                    <span className="leading-tight">{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <Link
            to="/create"
            aria-label="Create post"
            className={cn(
              "liquid-plus pointer-events-auto tap-scale flex size-[56px] shrink-0 items-center justify-center rounded-full text-white hover:brightness-105",
              pathname === "/create" && "ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <Plus size={22} strokeWidth={2.4} className="block" />
          </Link>
        </div>
      </nav>
    </>
  );
}
