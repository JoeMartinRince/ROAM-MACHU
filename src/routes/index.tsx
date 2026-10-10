import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Bell, Compass, Flame, Fuel, Plus, Radio } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-header.png";
import logoDark from "@/assets/logo-dark.png";
import { creators, formatCount, places as allPlaces } from "@/lib/data";
import { rankedPlaces, useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roam Machu — Discover travel stories" },
      {
        name: "description",
        content: "Travel-only social feed: trips, places and creators across Kerala and India.",
      },
      { property: "og:title", content: "Roam Machu — Discover travel stories" },
      {
        property: "og:description",
        content: "Travel-only social feed: trips, places and creators across Kerala and India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function TripCirclesSkeleton() {
  return (
    <div className="no-scrollbar -mx-4 mt-2 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-3 lg:gap-4 lg:px-0">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex w-15 shrink-0 flex-col items-center gap-1 lg:w-16 lg:gap-1.5">
          <Skeleton className="size-14 rounded-full lg:size-16" />
          <Skeleton className="h-3 w-11 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function Home() {
  const s = useStore();
  const { posts } = s;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 160);
    return () => clearTimeout(t);
  }, []);

  const topPlaces = useMemo(() => rankedPlaces(s).slice(0, 5), [s]);
  const liveCreators = useMemo(() => creators.filter((c) => c.live), []);
  const raised = 18400;
  const goal = 30000;
  const pct = Math.round((raised / goal) * 100);

  return (
    <div className="px-4 lg:mx-auto lg:flex lg:max-w-[1060px] lg:items-start lg:justify-center lg:gap-8 lg:px-8 lg:py-8">
      {/* Center feed column */}
      <div className="min-w-0 flex-1 lg:max-w-[600px]">
        <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-border/50 bg-background/85 px-4 pb-2 pt-[calc(var(--safe-top)+0.5rem)] backdrop-blur-xl lg:hidden">
          <div aria-hidden="true" className="size-9 shrink-0" />
          <Link
            to="/"
            aria-label="Roam Machu home"
            className="tap-scale inline-flex items-center justify-center"
          >
            <img src={logo} alt="Roam Machu" className="h-7.5 w-auto object-contain dark:hidden" />
            <img
              src={logoDark}
              alt="Roam Machu"
              className="hidden h-7.5 w-auto object-contain dark:block"
            />
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => toast("You're all caught up on new roams!")}
            className="tap-scale relative grid size-9 shrink-0 place-items-center rounded-full border border-border/80 bg-muted/80 text-foreground transition-colors hover:bg-muted"
          >
            <Bell size={17} />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </header>

        <div className="mt-2.5 flex items-baseline justify-between lg:mt-0">
          <h1 className="text-lg font-bold tracking-tight text-foreground lg:text-2xl">Discover</h1>
          <span className="text-xs font-medium text-muted-foreground">Live roams</span>
        </div>

        {!ready ? (
          <TripCirclesSkeleton />
        ) : (
          <div className="no-scrollbar -mx-4 mt-2 flex items-start gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-3 lg:gap-4 lg:px-0">
            <Link
              to="/create"
              className="tap-scale flex w-15 shrink-0 flex-col items-center gap-1 lg:w-16 lg:gap-1.5"
            >
              <span className="grid size-14 place-items-center rounded-full border-[1.5px] border-dashed border-primary/50 bg-secondary/80 text-primary transition-colors hover:bg-secondary lg:size-16">
                <Plus size={20} strokeWidth={2.25} />
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium text-foreground lg:text-xs">
                Add trip
              </span>
            </Link>
            {creators.map((c) => (
              <Link
                key={c.handle}
                to="/profile"
                className="tap-scale flex w-15 shrink-0 flex-col items-center gap-1 lg:w-16 lg:gap-1.5"
              >
                <span className="relative grid size-14 place-items-center rounded-full bg-gradient-to-tr from-primary via-[#FF7A45] to-teal p-[2px] lg:size-16">
                  <span className="grid size-full place-items-center rounded-full bg-background p-[2px]">
                    <Avatar name={c.name} className="size-full text-xs font-semibold ring-0" />
                  </span>
                  {c.live && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-1.5 py-[1px] text-[10px] leading-none font-bold text-primary-foreground uppercase ring-2 ring-background">
                      LIVE
                    </span>
                  )}
                </span>
                <span className="w-full truncate text-center text-[11px] font-medium text-foreground/90 lg:text-xs">
                  {c.name.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-3 space-y-3.5 lg:mt-6 lg:space-y-6">
          {!ready
            ? Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)
            : posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </div>

      {/* Desktop Right Rail (320px) */}
      <aside
        aria-label="Trending and live activity"
        className="hidden lg:sticky lg:top-8 lg:flex lg:w-[320px] lg:shrink-0 lg:flex-col lg:gap-5"
      >
        {/* Card 1: Trending places */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
              <Flame size={16} className="text-primary" />
              Trending places
            </h2>
            <Link
              to="/explore"
              className="tap-scale text-xs font-semibold text-primary hover:underline"
            >
              See all
            </Link>
          </div>
          <ol className="mt-3.5 space-y-2.5">
            {topPlaces.map((p, i) => (
              <li key={p.id}>
                <Link
                  to="/place/$id"
                  params={{ id: p.id }}
                  className="tap-scale flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-2 transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  <span className="w-5 text-center text-xs font-bold text-muted-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="size-10 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.region}</p>
                  </div>
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-teal tabular-nums">
                    {p.score}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Card 2: Live trips */}
        <section className="rounded-3xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground">
              <Radio size={16} className="text-primary" />
              Live trips
            </h2>
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary uppercase">
              {liveCreators.length} active
            </span>
          </div>
          <div className="mt-3.5 space-y-2.5">
            {liveCreators.map((c, i) => {
              const p = allPlaces[[17, 0, 16][i] ?? i]!;
              return (
                <Link
                  key={c.handle}
                  to="/place/$id"
                  params={{ id: p.id }}
                  className="tap-scale flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 p-2.5 transition-colors hover:border-primary/40 hover:bg-muted"
                >
                  <span className="relative shrink-0 rounded-full p-[1.5px] ring-2 ring-primary">
                    <Avatar name={c.name} className="size-9 text-xs ring-0" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">@{c.handle}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground uppercase">
                    LIVE
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Card 3: Fuel the Roam goal card */}
        <section className="rounded-3xl border border-border bg-secondary/45 p-5 shadow-card dark:bg-card">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                <Compass size={15} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-foreground">
                  Next trip: Spiti Valley
                </p>
                <p className="truncate text-[11px] text-muted-foreground">by @chai.nomad</p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary tabular-nums">
              {pct}%
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-background/90 ring-1 ring-border/50 dark:bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-teal transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs tabular-nums">
            <span className="font-semibold text-foreground">₹{formatCount(raised)} raised</span>
            <span className="text-muted-foreground">Goal ₹{formatCount(goal)}</span>
          </div>

          <button
            type="button"
            onClick={() => toast.success("Thanks for fueling the roam! ⛽")}
            className="tap-scale mt-3.5 flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-teal px-4 text-xs font-semibold text-white shadow-card transition-opacity hover:opacity-95"
          >
            <Fuel size={15} />
            <span>Fuel the Roam</span>
          </button>
        </section>
      </aside>
    </div>
  );
}
