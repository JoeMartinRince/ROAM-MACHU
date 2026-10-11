import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Camera,
  Check,
  Clapperboard,
  Compass,
  Eye,
  Fuel,
  HeartHandshake,
  MapPin,
  Plus,
  Settings,
  Share2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatCount,
  formatMoneyFull,
  formatMoneyShort,
  photos,
  places,
  type Post,
  type TripFund,
} from "@/lib/data";
import {
  closeTripFund,
  createTripFund,
  getActiveFundsByOwner,
  getCreatorByHandle,
  getFundsByOwner,
  isFollowing,
  toggleFollow,
  updateCurrentUser,
  updateTripFund,
  useStore,
} from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { processAvatarFile } from "@/hooks/use-profile-avatar";
import { FundDetailSheet, FuelTripSheet, TripFundCard } from "@/components/TripFundCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/u/$handle")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.handle} — Roam Machu` },
      {
        name: "description",
        content: `Travel creator profile for @${params.handle}: reels, trips, and funded roams.`,
      },
      { property: "og:title", content: `@${params.handle} — Roam Machu` },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { handle } = useParams({ from: "/u/$handle" });
  const navigate = useNavigate();
  const store = useStore();

  const cleanHandle = handle.replace(/^@/, "").toLowerCase();
  const isOwn = store.currentUser.handle.toLowerCase() === cleanHandle;

  // Redirect to own profile if handle matches current user
  useEffect(() => {
    if (isOwn) {
      navigate({ to: "/profile", replace: true });
    }
  }, [isOwn, navigate]);

  const creator = useMemo(
    () => getCreatorByHandle(cleanHandle),
    [cleanHandle, store.creators, store.currentUser],
  );
  const funds = useMemo(() => getFundsByOwner(cleanHandle), [cleanHandle, store.funds]);
  const activeFunds = useMemo(() => getActiveFundsByOwner(cleanHandle), [cleanHandle, store.funds]);
  const following = isFollowing(cleanHandle);

  const [tab, setTab] = useState<"reels" | "trips">("reels");
  const [selectedFund, setSelectedFund] = useState<TripFund | null>(null);
  const [fuelSheetFund, setFuelSheetFund] = useState<TripFund | null>(null);
  const fundsSectionRef = useRef<HTMLDivElement>(null);

  // User posts
  const creatorPosts = useMemo(
    () => store.posts.filter((p) => p.creator.toLowerCase() === cleanHandle),
    [store.posts, cleanHandle],
  );
  const creatorReels = useMemo(
    () => store.reels.filter((p) => p.creator.toLowerCase() === cleanHandle),
    [store.reels, cleanHandle],
  );

  const grid =
    tab === "reels"
      ? creatorReels.length > 0
        ? creatorReels
        : store.reels.slice(0, 3)
      : creatorPosts;
  const fundedCount = useMemo(() => funds.filter((f) => f.status === "funded").length, [funds]);

  const followerCount = (creator?.followers ?? 1200) + (following ? 1 : 0);

  const handleFuelMainClick = () => {
    if (activeFunds.length === 1) {
      setFuelSheetFund(activeFunds[0]);
    } else if (activeFunds.length > 1) {
      fundsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      toast("Select a trip fund below to fuel! ⛽");
    }
  };

  if (!creator) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
          <Compass size={24} />
        </span>
        <h1 className="mt-3 text-lg font-semibold text-foreground">Creator not found</h1>
        <p className="mt-1 text-xs text-muted-foreground">@{handle} does not exist yet.</p>
        <Link
          to="/"
          className="tap-scale mt-4 inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground"
        >
          Back home
        </Link>
      </div>
    );
  }

  const coverImg = creator.cover || photos.hills;

  return (
    <div className="lg:mx-auto lg:max-w-[1080px] lg:px-8 lg:py-8">
      {/* Cover image */}
      <div className="relative h-36 w-full overflow-hidden lg:h-60 lg:rounded-[20px]">
        <img src={coverImg} alt="" className="size-full object-cover" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background via-background/60 to-transparent"
        />
      </div>

      <div className="relative -mt-11 flex flex-col items-center px-4 text-center lg:-mt-11 lg:px-6">
        {/* Desktop row: Avatar + Name/Handle on left, Stats + Action buttons in a row on right */}
        <div className="flex w-full flex-col items-center lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-4 xl:flex-nowrap xl:gap-6">
          <div className="flex flex-col items-center lg:flex-row lg:items-end lg:gap-3.5 xl:gap-4 lg:text-left">
            <Avatar
              name={creator.name}
              src={creator.avatar}
              className="size-[88px] text-xl ring-4 ring-white shadow-card dark:ring-black"
            />
            <div className="lg:pb-1">
              <h1 className="mt-2.5 whitespace-nowrap text-xl font-semibold tracking-tight text-foreground lg:mt-0">
                {creator.name}
              </h1>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">@{creator.handle}</p>
              {creator.bio && (
                <p className="mt-1.5 max-w-md text-xs text-foreground/80 leading-relaxed font-sans">
                  {creator.bio}
                </p>
              )}
            </div>
          </div>

          <div className="w-full lg:flex lg:w-auto lg:items-center lg:gap-4 lg:pb-1 xl:gap-6">
            {/* Slim stats row */}
            <div className="mt-3 grid w-full grid-cols-3 divide-x divide-border py-1 lg:mt-0 lg:w-auto">
              {[
                ["Posts", creatorPosts.length + creatorReels.length || 24],
                ["Followers", followerCount],
                ["Trips funded", fundedCount],
              ].map(([l, n]) => (
                <div key={l} className="px-3 text-center lg:px-4">
                  <p className="font-display text-base font-normal text-foreground tabular-nums">
                    {formatCount(n as number)}
                  </p>
                  <p className="whitespace-nowrap text-xs font-normal text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>

            {/* Public Profile Action Buttons (Follow + Fuel the trip) */}
            <div className="mt-3 grid w-full grid-cols-2 gap-2.5 lg:mt-0 lg:flex lg:w-auto lg:shrink-0">
              <button
                type="button"
                aria-pressed={following}
                onClick={() => toggleFollow(cleanHandle)}
                className={cn(
                  "tap-scale flex h-10 items-center justify-center gap-1.5 rounded-full border border-border px-3 font-display text-xs font-normal transition-colors sm:text-sm lg:h-11 lg:px-5",
                  following
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-background text-foreground hover:bg-muted/60",
                )}
              >
                {following && <Check size={14} />}
                <span>{following ? "Following" : "Follow"}</span>
              </button>

              <button
                type="button"
                onClick={handleFuelMainClick}
                disabled={activeFunds.length === 0}
                className={cn(
                  "tap-scale flex h-10 items-center justify-center gap-1 rounded-full px-3 font-display text-xs font-normal text-white shadow-float transition-colors sm:gap-1.5 sm:text-sm lg:h-11 lg:px-5",
                  activeFunds.length > 0
                    ? "bg-teal hover:brightness-105"
                    : "bg-muted text-muted-foreground shadow-none cursor-not-allowed",
                )}
              >
                <Fuel size={14} className="shrink-0" />
                <span className="whitespace-nowrap">
                  {activeFunds.length > 0 ? "Fuel the trip" : "No active trips"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trip funds carousel / section */}
      <div ref={fundsSectionRef} className="mt-6 px-4 lg:px-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">Trip funds</h2>
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-teal uppercase">
              {funds.length} total
            </span>
          </div>
          {activeFunds.length > 0 && (
            <span className="text-xs font-mono text-muted-foreground">
              {activeFunds.length} active now
            </span>
          )}
        </div>

        {funds.length === 0 ? (
          <div className="rounded-[16px] border border-dashed border-border p-6 text-center">
            <p className="text-xs text-muted-foreground">No trip funds created yet.</p>
          </div>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
            {funds.map((f) => (
              <div key={f.id} className="w-[280px] shrink-0 lg:w-auto">
                <TripFundCard
                  fund={f}
                  canFuel={true}
                  onOpenDetail={(fund) => setSelectedFund(fund)}
                  onFuelClick={(fund) => setFuelSheetFund(fund)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media tabs (Reels, Trips - no Saved for public profile) */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="mt-6 grid grid-cols-2 border-b border-border px-4 text-xs font-medium sm:text-sm lg:mt-8 lg:px-0"
      >
        {[
          { id: "reels" as const, label: "Reels", icon: Clapperboard },
          { id: "trips" as const, label: "Trips", icon: Compass },
        ].map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(id)}
              className={cn(
                "tap-scale flex items-center justify-center gap-1.5 pb-2.5 text-xs font-medium capitalize transition-colors",
                active
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={15} className="shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Photo / Media Grid */}
      {grid.length === 0 ? (
        <div className="m-4 flex flex-col items-center justify-center rounded-[20px] border border-border bg-card px-6 py-10 text-center lg:mx-0">
          <span className="grid size-12 place-items-center rounded-full bg-muted text-foreground">
            <Compass size={22} />
          </span>
          <p className="mt-3 text-base font-semibold text-foreground">No {tab} posted yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Check back soon for updates from @{cleanHandle}.
          </p>
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
              <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 font-mono text-[11px] font-medium tracking-[0.05em] text-white backdrop-blur-xs tabular-nums uppercase">
                <Eye size={13} /> {formatCount(p.views)}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Fund Detail Sheet */}
      {selectedFund && (
        <FundDetailSheet
          fund={selectedFund}
          canFuel={true}
          onClose={() => setSelectedFund(null)}
          onFuelClick={(fund) => {
            setSelectedFund(null);
            setFuelSheetFund(fund);
          }}
        />
      )}

      {/* Fuel Payment Sheet */}
      {fuelSheetFund && (
        <FuelTripSheet fund={fuelSheetFund} onClose={() => setFuelSheetFund(null)} />
      )}
    </div>
  );
}
