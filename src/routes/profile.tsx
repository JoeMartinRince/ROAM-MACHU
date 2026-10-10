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
      <div className="relative h-44 w-full">
        <img src={photos.hills} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/20" />
      </div>

      <div className="relative -mt-12 flex flex-col items-center px-4 text-center">
        <Avatar name="Anu Joseph" className="size-24 text-2xl ring-4 ring-background shadow-card" />
        <h1 className="mt-2 text-xl font-semibold">Anu Joseph</h1>
        <p className="text-sm text-muted-foreground">@chai.nomad</p>

        <div className="mt-4 grid w-full grid-cols-3 divide-x divide-border">
          {[
            ["Posts", 128],
            ["Followers", 47300 + (following ? 1 : 0)],
            ["Trips funded", 12],
          ].map(([l, n]) => (
            <div key={l} className="px-2">
              <p className="text-lg font-semibold tabular-nums">{formatCount(n as number)}</p>
              <p className="text-xs text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex w-full gap-2.5 sm:gap-3">
          <button
            type="button"
            aria-pressed={following}
            onClick={() => setFollowing((f) => !f)}
            className={cn(
              "tap-scale flex-1 rounded-full py-3 text-sm font-semibold transition-colors",
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
            className="tap-scale flex flex-1 items-center justify-center gap-1.5 rounded-full bg-teal px-3 py-3 text-sm font-semibold text-white shadow-card hover:opacity-90"
          >
            <Fuel size={16} className="shrink-0" />
            <span className="truncate">Fuel the Roam</span>
          </button>
        </div>

        <div className="mt-4 w-full rounded-2xl border border-border bg-cream p-4 text-left shadow-card dark:bg-card">
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-semibold text-foreground">Next trip: Spiti Valley</span>
            <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
              ₹{formatCount(raised)} / ₹{formatCount(goal)}
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-card dark:bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(raised / goal) * 100}%` }}
            />
          </div>
        </div>

        <ThemeToggle className="mt-3" />
      </div>

      <div
        role="tablist"
        aria-label="Profile sections"
        className="mt-6 grid grid-cols-3 border-b border-border text-sm font-medium"
      >
        {(["reels", "trips", "saved"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "tap-scale pb-2.5 capitalize transition-colors",
              tab === t
                ? "border-b-2 border-primary font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {grid.length === 0 ? (
        <div className="m-4 flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-card px-6 py-10 text-center shadow-card">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <EmptyIcon size={22} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">{emptyTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-4">
          {grid.map((p) => (
            <Link
              key={p.id}
              to={p.video ? "/reels" : "/place/$id"}
              params={{ id: p.placeId }}
              className="tap-scale relative aspect-[4/5] overflow-hidden rounded-2xl bg-card shadow-card ring-1 ring-border/40"
            >
              <img
                src={p.image}
                alt={p.caption}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-media-fade" />
              <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 text-xs font-medium text-on-media tabular-nums drop-shadow-sm">
                <Eye size={14} /> {formatCount(p.views)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
