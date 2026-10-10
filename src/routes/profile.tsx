import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bookmark, Clapperboard, Compass, Eye, Fuel } from "lucide-react";
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
      <div className="relative h-32 w-full overflow-hidden lg:h-60 lg:rounded-3xl lg:shadow-card">
        <img src={photos.hills} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      <div className="relative -mt-10 flex flex-col items-center px-4 text-center lg:-mt-12 lg:px-6">
        {/* Desktop row: Avatar + Name/Handle on left, Stats + Action buttons in a row on right */}
        <div className="flex w-full flex-col items-center lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-4 xl:flex-nowrap xl:gap-6">
          <div className="flex flex-col items-center lg:flex-row lg:items-end lg:gap-3.5 xl:gap-4 lg:text-left">
            <Avatar
              name="Anu Joseph"
              className="size-20 text-lg ring-4 ring-background shadow-card lg:size-24 xl:size-28 lg:text-2xl"
            />
            <div className="lg:pb-1">
              <h1 className="mt-2 text-base font-bold tracking-tight text-foreground sm:text-lg lg:mt-0 lg:text-xl xl:text-2xl whitespace-nowrap">
                Anu Joseph
              </h1>
              <p className="mt-0.5 text-xs font-medium text-muted-foreground lg:text-sm">
                @chai.nomad
              </p>
            </div>
          </div>

          <div className="w-full lg:flex lg:w-auto lg:items-center lg:gap-3 xl:gap-5 lg:pb-1">
            <div className="mt-2.5 grid w-full grid-cols-3 divide-x divide-border/80 rounded-2xl border border-border/80 bg-muted/45 py-2 lg:mt-0 lg:w-auto lg:px-1 lg:py-2.5 xl:min-w-[270px] xl:px-2">
              {[
                ["Posts", 128],
                ["Followers", 47300 + (following ? 1 : 0)],
                ["Trips funded", 12],
              ].map(([l, n]) => (
                <div key={l} className="px-2 lg:px-2.5 xl:px-3.5 text-center">
                  <p className="text-sm font-bold text-foreground tabular-nums sm:text-base">
                    {formatCount(n as number)}
                  </p>
                  <p className="text-[11px] font-medium text-muted-foreground whitespace-nowrap sm:text-xs">
                    {l}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-2.5 grid w-full grid-cols-2 gap-2.5 lg:mt-0 lg:flex lg:w-auto lg:shrink-0">
              <button
                type="button"
                aria-pressed={following}
                onClick={() => setFollowing((f) => !f)}
                className={cn(
                  "tap-scale flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors lg:h-11 lg:px-4 xl:px-6",
                  following
                    ? "border border-border bg-muted text-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground shadow-float hover:bg-primary/90",
                )}
              >
                {following ? "Following" : "Follow"}
              </button>
              <button
                type="button"
                onClick={() => toast.success("Thanks for fueling the roam! ⛽")}
                className="tap-scale flex h-10 items-center justify-center gap-1.5 rounded-full bg-teal px-4 text-sm font-semibold text-white shadow-card hover:opacity-95 lg:h-11 lg:px-4 xl:px-5"
              >
                <Fuel size={15} className="shrink-0" />
                <span className="truncate">Fuel the Roam</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trip-funding card and Appearance control (stacked on mobile, side-by-side on desktop) */}
        <div className="w-full lg:mt-5 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4">
          <div className="mt-2.5 w-full rounded-2xl border border-border/80 bg-secondary/45 px-3.5 py-2.5 text-left shadow-card lg:mt-0 lg:py-3 dark:bg-card">
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Compass size={13} />
                </span>
                <span className="truncate text-xs font-semibold text-foreground">
                  Next trip: Spiti Valley
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums">
                <span className="font-semibold text-foreground">₹{formatCount(raised)}</span>
                <span className="text-muted-foreground">/ ₹{formatCount(goal)}</span>
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[11px] font-bold text-primary">
                  {pct}%
                </span>
              </div>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-background/90 ring-1 ring-border/50 dark:bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-teal transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <ThemeToggle className="mt-2 lg:mt-0 lg:h-full" />
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="mt-3 grid grid-cols-3 border-b border-border px-4 text-xs font-medium sm:text-sm lg:mt-6 lg:px-0"
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
                "tap-scale flex items-center justify-center gap-1.5 pb-2 capitalize transition-colors lg:pb-2.5",
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
        <div className="m-4 flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card px-6 py-10 text-center shadow-card lg:mx-0">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <EmptyIcon size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 px-4 pt-3 pb-2 lg:grid-cols-3 lg:gap-4 lg:px-0 lg:pt-5 xl:grid-cols-4">
          {grid.map((p) => (
            <Link
              key={p.id}
              to={p.video ? "/reels" : "/place/$id"}
              params={{ id: p.placeId }}
              className="tap-scale relative aspect-[5/6] overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60 lg:aspect-[4/5]"
            >
              <img
                src={p.image}
                alt={p.caption}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-media-fade" />
              <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs tabular-nums">
                <Eye size={13} /> {formatCount(p.views)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
