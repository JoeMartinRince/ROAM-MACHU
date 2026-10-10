import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowBigDown, ArrowBigUp, CalendarRange, Camera, ChevronLeft, MapPin } from "lucide-react";
import { places } from "@/lib/data";
import { placeScore, useStore, votePlace } from "@/lib/store";
import { PostCard } from "@/components/PostCard";
import { PlaceAiOverview } from "@/components/PlaceAiOverview";
import { PlaceItinerary } from "@/components/PlaceItinerary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/place/$id")({
  loader: ({ params }) => {
    const place = places.find((p) => p.id === params.id);
    if (!place) throw notFound();
    return { place };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.place.name ?? "Place"} — Roam Machu` },
      {
        name: "description",
        content: `Posts, reels and trip itinerary for ${loaderData?.place.name}, ${loaderData?.place.region}.`,
      },
      { property: "og:title", content: `${loaderData?.place.name} — Roam Machu` },
      {
        property: "og:description",
        content: `Posts, reels and trip itinerary for ${loaderData?.place.name}.`,
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlacePage,
});

function PlacePage() {
  const { place } = Route.useLoaderData();
  const s = useStore();
  const router = useRouter();
  const [tab, setTab] = useState<"posts" | "reels" | "itinerary">("posts");
  const v = s.placeVotes[place.id] ?? 0;
  const score = placeScore(s, place.id);
  const items = (tab === "posts" ? s.posts : s.reels).filter((p) => p.placeId === place.id);

  return (
    <div className="lg:mx-auto lg:grid lg:max-w-[1160px] lg:grid-cols-12 lg:items-start lg:gap-8 lg:p-8">
      {/* Left column on desktop: Hero image + Score & Pwoli/Waste buttons */}
      <div className="lg:sticky lg:top-8 lg:col-span-5">
        <div className="relative h-72 sm:h-80 lg:h-[420px] lg:overflow-hidden lg:rounded-[20px] lg:shadow-card lg:ring-1 lg:ring-border/70">
          <img src={place.image} alt={place.name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-media-fade" />
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Back"
            className="tap-scale absolute left-4 top-[calc(var(--safe-top)+0.75rem)] grid size-10 place-items-center rounded-full border border-border/60 bg-card/90 text-foreground shadow-card backdrop-blur-md lg:top-4"
          >
            <ChevronLeft />
          </button>
          <div className="absolute bottom-6 left-4 right-4 text-on-media">
            <p className="flex items-center gap-1 font-mono text-[11px] font-medium tracking-[0.05em] uppercase opacity-90">
              <MapPin size={12} className="shrink-0" /> {place.region}
            </p>
            <h1 className="truncate text-xl font-semibold tracking-tight">{place.name}</h1>
          </div>
        </div>

        <div className="relative -mt-4 rounded-t-[20px] bg-background px-4 pt-5 lg:mt-4 lg:rounded-[20px] lg:border lg:border-border lg:bg-card lg:p-5 lg:shadow-card">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="shrink-0 rounded-[16px] bg-accent px-3.5 py-2 text-center">
              <p
                key={score}
                className="animate-count-pop font-display text-xl font-normal text-teal tabular-nums"
              >
                {score}
              </p>
              <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                SCORE
              </p>
            </div>
            <button
              type="button"
              aria-pressed={v === 1}
              onClick={() => votePlace(place.id, 1)}
              className={cn(
                "tap-scale flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full font-display text-sm font-normal transition-colors duration-200",
                v === 1
                  ? "animate-vote-bounce bg-primary text-primary-foreground shadow-float"
                  : "border border-border bg-muted text-foreground hover:bg-muted/80",
              )}
            >
              <ArrowBigUp size={19} fill={v === 1 ? "currentColor" : "none"} /> Pwoli
            </button>
            <button
              type="button"
              aria-pressed={v === -1}
              onClick={() => votePlace(place.id, -1)}
              className={cn(
                "tap-scale flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full font-display text-sm font-normal transition-colors duration-200",
                v === -1
                  ? "animate-vote-bounce bg-destructive text-destructive-foreground shadow-card"
                  : "border border-border bg-muted text-foreground hover:bg-muted/80",
              )}
            >
              <ArrowBigDown size={19} fill={v === -1 ? "currentColor" : "none"} /> Waste
            </button>
          </div>

          {/* AI Place Overview */}
          <PlaceAiOverview placeName={place.name} region={place.region} className="mt-4" />

          {/* Quick Trip Itinerary & Planner trigger */}
          <div className="mt-3 flex items-center justify-between rounded-[16px] border border-border bg-muted/50 p-3">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <CalendarRange size={18} />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">Trip Itinerary & Planner</p>
                <p className="text-[11px] text-muted-foreground">
                  Day-by-day schedule, budget & checklist
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setTab("itinerary")}
              className="tap-scale rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              Plan Trip
            </button>
          </div>
        </div>
      </div>

      {/* Right column on desktop: Tabs + Posts/Reels/Itinerary */}
      <div className="px-4 lg:col-span-7 lg:px-0">
        <div
          role="tablist"
          aria-label="Place media tabs"
          className="mt-6 grid grid-cols-3 border-b border-border text-sm font-medium lg:mt-0"
        >
          {(["posts", "reels", "itinerary"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "tap-scale flex items-center justify-center gap-1.5 pb-2.5 text-xs font-medium capitalize transition-colors",
                tab === t
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "itinerary" && <CalendarRange size={15} />}
              <span>{t === "itinerary" ? "Itinerary" : t}</span>
            </button>
          ))}
        </div>

        {tab === "itinerary" ? (
          <PlaceItinerary
            placeName={place.name}
            region={place.region}
            lat={place.lat}
            lng={place.lng}
          />
        ) : (
          <div
            className={cn(
              "mt-4 space-y-4 lg:mt-6",
              items.length > 0 && "lg:grid lg:grid-cols-2 lg:gap-5 lg:space-y-0",
            )}
          >
            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
                  <Camera size={22} />
                </span>
                <p className="mt-3 text-base font-semibold text-foreground">No {tab} here yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Visited {place.name}? Share your experience with fellow roamers.
                </p>
                <Link
                  to="/create"
                  className="tap-scale mt-4 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-float"
                >
                  Be the first to post
                </Link>
              </div>
            )}
            {items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
