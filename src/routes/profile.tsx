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
    <div>
      <div className="relative h-40 w-full overflow-hidden">
        <img src={photos.hills} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35" />
      </div>

      <div className="relative -mt-11 flex flex-col items-center px-4 text-center">
        <Avatar
          name="Anu Joseph"
          className="size-[88px] text-xl ring-4 ring-background shadow-card"
        />
        <h1 className="mt-2.5 text-lg font-bold tracking-tight text-foreground">Anu Joseph</h1>
        <p className="mt-0.5 text-xs font-medium text-muted-foreground">@chai.nomad</p>

        <div className="mt-3.5 grid w-full grid-cols-3 divide-x divide-border/80 rounded-2xl border border-border/80 bg-muted/45 py-2.5">
          {[
            ["Posts", 128],
            ["Followers", 47300 + (following ? 1 : 0)],
            ["Trips funded", 12],
          ].map(([l, n]) => (
            <div key={l} className="px-2">
              <p className="text-base font-bold text-foreground tabular-nums">
                {formatCount(n as number)}
              </p>
              <p className="text-xs font-medium text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-3.5 grid w-full grid-cols-2 gap-2.5">
          <button
            type="button"
            aria-pressed={following}
            onClick={() => setFollowing((f) => !f)}
            className={cn(
              "tap-scale flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold transition-colors",
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
            className="tap-scale flex h-11 items-center justify-center gap-1.5 rounded-full bg-teal px-4 text-sm font-semibold text-white shadow-card hover:opacity-95"
          >
            <Fuel size={16} className="shrink-0" />
            <span className="truncate">Fuel the Roam</span>
          </button>
        </div>

        <div className="mt-3.5 w-full rounded-2xl border border-border/80 bg-secondary/45 px-3.5 py-3 text-left shadow-card dark:bg-card">
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
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/90 ring-1 ring-border/50 dark:bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ThemeToggle className="mt-2.5" />
      </div>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="mt-4 grid grid-cols-3 border-b border-border px-4 text-sm font-medium"
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
        <div className="m-4 flex flex-col items-center justify-center rounded-3xl border border-border/70 bg-card px-6 py-10 text-center shadow-card">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <EmptyIcon size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pt-3.5 pb-4">
          {grid.map((p) => (
            <Link
              key={p.id}
              to={p.video ? "/reels" : "/place/$id"}
              params={{ id: p.placeId }}
              className="tap-scale relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/60"
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
    </div>
  );
}
