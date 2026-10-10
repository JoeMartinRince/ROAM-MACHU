import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Clapperboard, Compass, Eye, Fuel, Settings, X } from "lucide-react";
import { toast } from "sonner";
import { formatCount, photos } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Anu Joseph (@chai.nomad) — Roam Machu" },
      {
        name: "description",
        content: "Travel creator profile: reels, trips and the next roam goal.",
      },
      { property: "og:title", content: "Anu Joseph — Roam Machu" },
      {
        property: "og:description",
        content: "Travel creator profile: reels, trips and the next roam goal.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

function Profile() {
  const s = useStore();
  const [tab, setTab] = useState<"reels" | "trips" | "saved">("reels");
  const [following, setFollowing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const grid =
    tab === "reels"
      ? s.reels
      : tab === "trips"
        ? s.posts.filter((p) => p.creator === "chai.nomad")
        : s.posts.slice(4, 10);
  const raised = 18400,
    goal = 30000;
  const pct = Math.round((raised / goal) * 100);

  const TABS = [
    { id: "reels" as const, label: "Reels", icon: Clapperboard },
    { id: "trips" as const, label: "Trips", icon: Compass },
    { id: "saved" as const, label: "Saved", icon: Bookmark },
  ];

  const EmptyIcon = tab === "trips" ? Compass : tab === "saved" ? Bookmark : Clapperboard;
  const emptyTitle =
    tab === "trips"
      ? "No trips logged yet"
      : tab === "saved"
        ? "No saved places yet"
        : "No reels shared yet";
  const emptySubtitle =
    tab === "trips"
      ? "Start a new roam to document your journey."
      : tab === "saved"
        ? "Bookmark inspiring posts and places to plan your next trip."
        : "Record a short travel clip to share with the community.";

  return (
    <div className="lg:mx-auto lg:max-w-[1080px] lg:px-8 lg:py-8">
      <div className="relative h-36 w-full overflow-hidden lg:h-60 lg:rounded-[20px]">
        <img src={photos.hills} alt="" className="size-full object-cover" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent"
        />
        <button
          type="button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
          className="tap-scale absolute right-4 top-[calc(var(--safe-top)+0.75rem)] z-10 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md transition hover:bg-black/50 lg:top-4"
        >
          <Settings size={17} />
        </button>
      </div>

      <div className="relative -mt-11 flex flex-col items-center px-4 text-center lg:-mt-11 lg:px-6">
        {/* Desktop row: Avatar + Name/Handle on left, Stats + Action buttons in a row on right */}
        <div className="flex w-full flex-col items-center lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-4 xl:flex-nowrap xl:gap-6">
          <div className="flex flex-col items-center lg:flex-row lg:items-end lg:gap-3.5 xl:gap-4 lg:text-left">
            <Avatar
              name="Anu Joseph"
              className="size-[88px] text-xl ring-4 ring-white shadow-card dark:ring-black"
            />
            <div className="lg:pb-1">
              <h1 className="mt-2.5 text-2xl font-bold tracking-tight text-foreground lg:mt-0 whitespace-nowrap">
                Anu Joseph
              </h1>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">@chai.nomad</p>
            </div>
          </div>

          <div className="w-full lg:flex lg:w-auto lg:items-center lg:gap-4 xl:gap-6 lg:pb-1">
            {/* Slim stats row with thin dividers and no pill */}
            <div className="mt-3 grid w-full grid-cols-3 divide-x divide-border py-1 lg:mt-0 lg:w-auto">
              {[
                ["Posts", 128],
                ["Followers", 47300 + (following ? 1 : 0)],
                ["Trips funded", 12],
              ].map(([l, n]) => (
                <div key={l} className="px-3 text-center lg:px-4">
                  <p className="text-base font-semibold text-foreground tabular-nums">
                    {formatCount(n as number)}
                  </p>
                  <p className="text-xs font-normal text-muted-foreground whitespace-nowrap">{l}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid w-full grid-cols-2 gap-2.5 lg:mt-0 lg:flex lg:w-auto lg:shrink-0">
              <button
                type="button"
                aria-pressed={following}
                onClick={() => setFollowing((f) => !f)}
                className={cn(
                  "tap-scale flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium transition-colors lg:h-11 lg:px-5",
                  following
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "bg-background text-foreground hover:bg-muted/60",
                )}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button
                type="button"
                onClick={() => toast.success("Thanks for fueling the roam! ⛽")}
                className="tap-scale flex h-10 items-center justify-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-float transition-colors hover:bg-primary/90 lg:h-11 lg:px-5"
              >
                <Fuel size={15} className="shrink-0" />
                <span className="truncate">Fuel the Roam</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trip-funding goal card (16px radius, neutral surface, teal positive value) */}
        <div className="mt-3.5 w-full rounded-[16px] border border-border bg-card px-3.5 py-3 text-left lg:mt-5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                <Compass size={13} />
              </span>
              <span className="truncate text-sm font-semibold text-foreground">
                Next trip: Spiti Valley
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums">
              <span className="font-semibold text-foreground">₹{formatCount(raised)}</span>
              <span className="text-muted-foreground">/ ₹{formatCount(goal)}</span>
              <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-teal">
                {pct}%
              </span>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="mt-3.5 grid grid-cols-3 border-b border-border px-4 text-xs font-medium sm:text-sm lg:mt-6 lg:px-0"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "tap-scale flex items-center justify-center gap-1.5 pb-2.5 capitalize transition-colors",
                active
                  ? "border-b-2 border-primary font-semibold text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {grid.length === 0 ? (
        <div className="m-4 flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-10 text-center lg:mx-0">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
            <EmptyIcon size={22} />
          </span>
          <p className="mt-3 text-base font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 px-4 pt-3 pb-2 lg:grid-cols-3 lg:gap-4 lg:px-0 lg:pt-5 xl:grid-cols-4">
          {grid.map((p) => (
            <Link
              key={p.id}
              to={p.video ? "/reels" : "/place/$id"}
              params={{ id: p.placeId }}
              className="tap-scale relative aspect-[5/6] overflow-hidden rounded-[16px] bg-card ring-1 ring-border lg:aspect-[4/5]"
            >
              <img
                src={p.image}
                alt={p.caption}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-media-fade" />
              <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs tabular-nums">
                <Eye size={13} /> {formatCount(p.views)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Settings Sheet Modal (opened by gear icon in top-right of cover) */}
      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          className="fixed inset-0 z-[1100] flex items-end justify-center sm:items-center"
        >
          <div
            aria-hidden="true"
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-[20px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[20px] sm:pb-5">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Settings</h2>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
                className="tap-scale grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
