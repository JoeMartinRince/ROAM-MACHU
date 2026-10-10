import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, Flame, Compass, X } from "lucide-react";
import { toast } from "sonner";
import { creators, places as allPlaces } from "@/lib/data";
import { rankedPlaces, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const PlacesMap = lazy(() => import("@/components/PlacesMap"));

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explore places — Roam Machu" },
      {
        name: "description",
        content: "Live trips, a map of scored places and trending spots across India.",
      },
      { property: "og:title", content: "Explore places — Roam Machu" },
      {
        property: "og:description",
        content: "Live trips, a map of scored places and trending spots across India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

function PlacesListSkeleton() {
  return (
    <div className="mt-3 space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-2 shadow-card"
        >
          <Skeleton className="h-4 w-6 rounded-full" />
          <Skeleton className="size-14 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <Skeleton className="mr-2 h-7 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function Explore() {
  const s = useStore();
  const [mode, setMode] = useState<"map" | "list">("list");
  const [q, setQ] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 160);
    return () => clearTimeout(t);
  }, []);

  const ranked = useMemo(() => rankedPlaces(s), [s]);
  const filtered = ranked.filter((p) =>
    (p.name + " " + p.region).toLowerCase().includes(q.trim().toLowerCase()),
  );
  const live = creators.filter((c) => c.live);

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top,0px)+1rem)]">
      <h1 className="text-xl font-bold tracking-tight text-foreground">Explore</h1>
      <div className="mt-3 flex gap-2">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-full border border-input bg-muted px-4 focus-within:ring-2 focus-within:ring-ring">
          <Search size={18} className="shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search places or regions"
            aria-label="Search places"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="tap-scale grid size-5 place-items-center rounded-full bg-card text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </label>
        <button
          type="button"
          aria-label="Filters"
          onClick={() => toast("Sorted by highest Roam Score")}
          className="tap-scale grid size-11 shrink-0 place-items-center rounded-full border border-border bg-navy text-on-media shadow-card hover:opacity-90"
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Explore view mode"
        className="mt-4 grid grid-cols-2 rounded-full border border-border/60 bg-muted p-1 text-sm font-medium"
      >
        {(["map", "list"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={cn(
              "tap-scale rounded-full py-2 capitalize transition",
              mode === m
                ? "bg-card font-semibold text-primary shadow-card"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "map" ? (
        <div className="mt-4 h-[60vh] overflow-hidden rounded-3xl border border-border/60 shadow-card">
          <ClientOnly fallback={<Skeleton className="size-full rounded-none" />}>
            <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
              <PlacesMap places={filtered} className="size-full" />
            </Suspense>
          </ClientOnly>
        </div>
      ) : (
        <>
          <h2 className="mt-6 font-semibold">Live trips</h2>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
            {live.map((c, i) => {
              const p = allPlaces[[17, 0, 16][i] ?? i]!;
              return (
                <Link
                  key={c.handle}
                  to="/place/$id"
                  params={{ id: p.id }}
                  className="tap-scale relative h-56 w-36 shrink-0 overflow-hidden rounded-3xl bg-card shadow-card ring-1 ring-border/40"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-media-fade" />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
                    LIVE
                  </span>
                  <div className="absolute bottom-3 left-3 right-3 text-on-media">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs opacity-85">@{c.handle}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <h2 className="mt-6 flex items-center gap-1.5 font-semibold">
        <Flame size={18} className="text-primary" /> Trending places
      </h2>
      {!ready ? (
        <PlacesListSkeleton />
      ) : filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border border-border/60 bg-card px-6 py-10 text-center shadow-card">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Compass size={24} />
          </span>
          <p className="mt-3 text-sm font-semibold text-foreground">No places match "{q}"</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try searching another destination or region across India.
          </p>
          <button
            type="button"
            onClick={() => setQ("")}
            className="tap-scale mt-4 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold text-primary"
          >
            Reset search
          </button>
        </div>
      ) : (
        <ol className="mt-3 space-y-2">
          {filtered.map((p, i) => (
            <li key={p.id}>
              <Link
                to="/place/$id"
                params={{ id: p.id }}
                className="tap-scale flex items-center gap-3 rounded-2xl border border-border/50 bg-card p-2 shadow-card hover:border-primary/40"
              >
                <span className="w-6 text-center text-sm font-bold text-muted-foreground tabular-nums">
                  {i + 1}
                </span>
                <img
                  src={p.image}
                  alt=""
                  loading="lazy"
                  className="size-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.region}</p>
                </div>
                <span className="mr-2 rounded-full bg-accent px-3 py-1 text-sm font-semibold text-teal tabular-nums">
                  {p.score}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
