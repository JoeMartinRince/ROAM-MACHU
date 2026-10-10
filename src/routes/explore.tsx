import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    <div className="mt-2 space-y-1.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 rounded-[16px] border border-border bg-card px-2.5 py-2"
        >
          <Skeleton className="h-3.5 w-4 rounded-full" />
          <Skeleton className="size-11 shrink-0 rounded-[12px]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-32 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <Skeleton className="mr-1 h-6 w-10 rounded-full" />
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 160);
    return () => clearTimeout(t);
  }, []);

  const ranked = useMemo(() => rankedPlaces(s), [s]);
  const filtered = ranked.filter((p) =>
    (p.name + " " + p.region).toLowerCase().includes(q.trim().toLowerCase()),
  );
  const live = creators.filter((c) => c.live);

  const handleSelectPlaceFromMap = useCallback((id: string) => {
    setSelectedId(id);
    const el = itemRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  const activePlaceId = hoveredId ?? selectedId;

  return (
    <div className="px-4 pt-[calc(var(--safe-top)+0.75rem)] lg:flex lg:h-dvh lg:overflow-hidden lg:px-0 lg:pt-0">
      {/* Left panel on desktop (400px), full column on mobile */}
      <div className="lg:flex lg:h-full lg:w-[400px] lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card/60">
        <div className="lg:border-b lg:border-border/70 lg:p-5">
          <h1 className="font-display text-[21px] font-semibold text-foreground">Explore</h1>
          <div className="mt-2.5 flex gap-2 lg:mt-3">
            <label className="flex h-10 flex-1 items-center gap-2 rounded-full border border-input bg-muted px-3.5 focus-within:ring-2 focus-within:ring-ring lg:h-11 lg:px-4">
              <Search size={16} className="shrink-0 text-muted-foreground" />
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
              className="tap-scale grid size-10 shrink-0 place-items-center rounded-full border border-border bg-muted text-foreground transition-colors hover:bg-muted/80 lg:size-11"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          <div
            role="tablist"
            aria-label="Explore view mode"
            className="mt-2.5 grid grid-cols-2 rounded-full border border-border bg-muted p-1 text-xs font-medium sm:text-sm lg:hidden"
          >
            {(["map", "list"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className={cn(
                  "tap-scale rounded-full py-1.5 font-display text-xs capitalize transition",
                  mode === m
                    ? "bg-card font-semibold text-primary shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list container on desktop, normal flow on mobile */}
        <div className="lg:no-scrollbar lg:flex-1 lg:overflow-y-auto lg:p-5">
          {mode === "list" && (
            <div className="lg:hidden">
              <div className="mt-3.5 flex items-center justify-between">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Live trips
                </h2>
                <span className="text-xs font-normal text-muted-foreground">
                  {live.length} active now
                </span>
              </div>
              <div className="no-scrollbar -mx-4 mt-2 flex gap-2.5 overflow-x-auto px-4 pb-1">
                {live.map((c, i) => {
                  const p = allPlaces[[17, 0, 16][i] ?? i]!;
                  return (
                    <Link
                      key={c.handle}
                      to="/place/$id"
                      params={{ id: p.id }}
                      className="tap-scale relative h-36 w-[154px] shrink-0 overflow-hidden rounded-[20px] border border-border bg-card"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover"
                      />
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
                      />
                      <span className="absolute left-2.5 top-2.5 rounded-full bg-primary px-2 py-0.5 text-[10px] leading-tight font-semibold tracking-wide text-primary-foreground uppercase">
                        LIVE
                      </span>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-on-media">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow-xs">
                          {p.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-normal text-white/80">
                          @{c.handle}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className={cn(mode === "map" && "hidden lg:block")}>
            <h2 className="mt-3.5 flex items-center gap-1.5 text-base font-semibold tracking-tight text-foreground lg:mt-0">
              <Flame size={16} className="text-muted-foreground" /> Trending places
            </h2>
            {!ready ? (
              <PlacesListSkeleton />
            ) : filtered.length === 0 ? (
              <div className="mt-3 flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
                  <Compass size={22} />
                </span>
                <p className="mt-3 text-base font-semibold text-foreground">
                  No places match "{q}"
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try searching another destination or region across India.
                </p>
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="tap-scale mt-4 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-foreground"
                >
                  Reset search
                </button>
              </div>
            ) : (
              <ol className="mt-2 space-y-1.5">
                {filtered.map((p, i) => {
                  const isHighlighted = activePlaceId === p.id;
                  return (
                    <li
                      key={p.id}
                      ref={(node) => {
                        itemRefs.current[p.id] = node;
                      }}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId((prev) => (prev === p.id ? null : prev))}
                    >
                      <Link
                        to="/place/$id"
                        params={{ id: p.id }}
                        className={cn(
                          "tap-scale flex items-center gap-2.5 rounded-[16px] border bg-card px-2.5 py-2 transition-colors",
                          isHighlighted
                            ? "border-primary bg-muted/60"
                            : "border-border hover:bg-muted/40",
                        )}
                      >
                        <span className="w-4 shrink-0 text-center font-display text-xs font-semibold text-muted-foreground tabular-nums">
                          {i + 1}
                        </span>
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="size-11 shrink-0 rounded-[12px] object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-base font-semibold leading-snug text-foreground">
                            {p.name}
                          </p>
                          <p className="truncate text-xs font-normal text-muted-foreground">
                            {p.region}
                          </p>
                        </div>
                        <span className="mr-0.5 shrink-0 rounded-full bg-accent px-2.5 py-0.5 font-display text-xs font-semibold text-teal tabular-nums">
                          {p.score}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Map panel: shown on mobile when mode === "map", always fills right pane on lg+ */}
      <div
        className={cn(
          mode === "map"
            ? "mt-3 h-[calc(100dvh-var(--bottom-nav-clearance)-9.5rem)] min-h-[320px] overflow-hidden rounded-[20px] border border-border"
            : "hidden",
          "lg:mt-0 lg:block lg:h-full lg:flex-1 lg:rounded-none lg:border-0",
        )}
      >
        <ClientOnly fallback={<Skeleton className="size-full rounded-none" />}>
          <Suspense fallback={<Skeleton className="size-full rounded-none" />}>
            <PlacesMap
              places={filtered}
              className="size-full"
              activePlaceId={activePlaceId}
              onSelectPlace={handleSelectPlaceFromMap}
            />
          </Suspense>
        </ClientOnly>
      </div>
    </div>
  );
}
