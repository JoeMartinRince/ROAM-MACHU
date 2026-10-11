import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Camera,
  Check,
  Clapperboard,
  Compass,
  Eye,
  Fuel,
  Image as ImageIcon,
  MoreVertical,
  Plus,
  Settings,
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
  type TripFund,
} from "@/lib/data";
import {
  closeTripFund,
  createTripFund,
  getFundsByOwner,
  updateCurrentUser,
  updateTripFund,
  useStore,
} from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { processAvatarFile } from "@/hooks/use-profile-avatar";
import { FundDetailSheet, TripFundCard } from "@/components/TripFundCard";
import { cn } from "@/lib/utils";

const PRESET_COVERS = [
  { id: "hills", name: "Misty Hills", src: photos.hills },
  { id: "beach", name: "Sunset Cliff", src: photos.beach },
  { id: "backwaters", name: "Backwaters", src: photos.backwaters },
  { id: "temple", name: "Ancient Heritage", src: photos.temple },
];

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — Roam Machu" },
      {
        name: "description",
        content: "Travel creator profile: reels, trips and managed trip funds.",
      },
      { property: "og:title", content: "My Profile — Roam Machu" },
      { property: "og:type", content: "profile" },
    ],
  }),
  component: OwnProfile,
});

function OwnProfile() {
  const store = useStore();
  const { currentUser } = store;

  const [tab, setTab] = useState<"reels" | "trips" | "saved">("reels");
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createFundOpen, setCreateFundOpen] = useState(false);
  const [editingFund, setEditingFund] = useState<TripFund | null>(null);
  const [selectedFund, setSelectedFund] = useState<TripFund | null>(null);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Funds owned by current user
  const myFunds = useMemo(
    () => getFundsByOwner(currentUser.handle),
    [currentUser.handle, store.funds],
  );
  const fundedCount = useMemo(() => myFunds.filter((f) => f.status === "funded").length, [myFunds]);

  // User posts / reels / saved
  const myPosts = useMemo(
    () => store.posts.filter((p) => p.creator.toLowerCase() === currentUser.handle.toLowerCase()),
    [store.posts, currentUser.handle],
  );
  const myReels = useMemo(
    () => store.reels.filter((p) => p.creator.toLowerCase() === currentUser.handle.toLowerCase()),
    [store.reels, currentUser.handle],
  );
  const savedPosts = useMemo(
    () =>
      store.savedPostIds.length > 0
        ? store.posts.filter((p) => store.savedPostIds.includes(p.id))
        : store.posts.slice(0, 4),
    [store.posts, store.savedPostIds],
  );

  const grid = tab === "reels" ? myReels : tab === "trips" ? myPosts : savedPosts;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await processAvatarFile(file);
      updateCurrentUser({ avatar: dataUrl });
      toast.success("Profile picture updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile picture");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const TABS = [
    { id: "reels" as const, label: "Reels", icon: Clapperboard },
    { id: "trips" as const, label: "Trips", icon: Compass },
    { id: "saved" as const, label: "Saved", icon: Bookmark },
  ];

  const coverImg = currentUser.cover || photos.hills;

  return (
    <div className="lg:mx-auto lg:max-w-[1080px] lg:px-8 lg:py-8">
      {/* Cover image with gear settings icon */}
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
        <button
          type="button"
          aria-label="Appearance & Settings"
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
            <div className="group relative">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
                title="Change profile picture"
                aria-label="Change profile picture"
                className="tap-scale relative block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Avatar
                  name={currentUser.name}
                  src={currentUser.avatar}
                  className="size-[88px] text-xl ring-4 ring-white shadow-card transition duration-200 group-hover:brightness-95 dark:ring-black"
                />
                <span className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-white transition-transform duration-200 group-hover:scale-110 dark:ring-black">
                  <Camera size={14} />
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
                aria-label="Upload profile picture"
              />
            </div>
            <div className="lg:pb-1">
              <h1 className="mt-2.5 whitespace-nowrap text-xl font-semibold tracking-tight text-foreground lg:mt-0">
                {currentUser.name}
              </h1>
              <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                @{currentUser.handle}
              </p>
              {currentUser.bio && (
                <p className="mt-1.5 max-w-md text-xs text-foreground/80 leading-relaxed font-sans">
                  {currentUser.bio}
                </p>
              )}
            </div>
          </div>

          <div className="w-full lg:flex lg:w-auto lg:items-center lg:gap-4 lg:pb-1 xl:gap-6">
            {/* Slim stats row */}
            <div className="mt-3 grid w-full grid-cols-3 divide-x divide-border py-1 lg:mt-0 lg:w-auto">
              {[
                ["Posts", myPosts.length + myReels.length],
                ["Followers", 0],
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

            {/* Single "Edit profile" button for owner */}
            <div className="mt-3 w-full lg:mt-0 lg:w-auto lg:shrink-0">
              <button
                type="button"
                onClick={() => setEditProfileOpen(true)}
                className="tap-scale flex h-10 w-full items-center justify-center rounded-full border border-border px-5 font-display text-xs font-normal text-foreground transition-colors hover:bg-muted sm:text-sm lg:h-11 lg:w-auto"
              >
                Edit profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "My trip funds" Section */}
      <div className="mt-6 px-4 lg:px-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">My trip funds</h2>
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-teal uppercase">
              {myFunds.length} total
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingFund(null);
              setCreateFundOpen(true);
            }}
            className="tap-scale inline-flex items-center gap-1.5 rounded-full bg-teal px-3.5 py-1.5 font-display text-xs font-normal text-white shadow-xs hover:brightness-105"
          >
            <Plus size={14} />
            <span>New trip fund</span>
          </button>
        </div>

        {myFunds.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-card/60 p-8 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-teal/15 text-teal">
              <Compass size={24} />
            </span>
            <h3 className="mt-3 text-base font-semibold text-foreground">
              Plan your first trip fund
            </h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              Gather support from the travel community to fuel your next expedition, trek, or road
              trip.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingFund(null);
                setCreateFundOpen(true);
              }}
              className="tap-scale mt-4 inline-flex items-center gap-1.5 rounded-full bg-teal px-4 py-2 font-display text-xs font-normal text-white shadow-xs"
            >
              <Plus size={14} />
              <span>Create trip fund</span>
            </button>
          </div>
        ) : (
          <div className="no-scrollbar -mx-4 flex gap-3.5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-5 lg:overflow-visible lg:px-0">
            {myFunds.map((f) => (
              <div key={f.id} className="w-[280px] shrink-0 lg:w-auto relative">
                <TripFundCard
                  fund={f}
                  canFuel={false}
                  onOpenDetail={(fund) => setSelectedFund(fund)}
                />
                {/* Manage controls for owner */}
                <div className="mt-2 flex items-center justify-between px-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFund(f);
                      setCreateFundOpen(true);
                    }}
                    className="tap-scale text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Edit fund
                  </button>
                  {f.status !== "closed" && (
                    <button
                      type="button"
                      onClick={() => {
                        closeTripFund(f.id);
                        toast.success("Trip fund closed");
                      }}
                      className="tap-scale text-xs font-medium text-destructive hover:underline"
                    >
                      Close fund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs below: Reels, Trips, Saved */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="mt-6 grid grid-cols-3 border-b border-border px-4 text-xs font-medium sm:text-sm lg:mt-8 lg:px-0"
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
          <p className="mt-3 text-base font-semibold text-foreground">
            {tab === "saved"
              ? "No saved posts yet"
              : tab === "reels"
                ? "No reels uploaded"
                : "No trips logged"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {tab === "saved"
              ? "Bookmark inspiring posts to revisit anytime."
              : "Share a new roam from the create button below."}
          </p>
          {tab !== "saved" && (
            <Link
              to="/create"
              className="tap-scale mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs"
            >
              <Plus size={14} />
              <span>Share roam</span>
            </Link>
          )}
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

      {/* Edit Profile Sheet */}
      {editProfileOpen && (
        <EditProfileModal currentUser={currentUser} onClose={() => setEditProfileOpen(false)} />
      )}

      {/* New / Edit Trip Fund Modal */}
      {createFundOpen && (
        <TripFundFormModal
          fund={editingFund}
          onClose={() => {
            setCreateFundOpen(false);
            setEditingFund(null);
          }}
        />
      )}

      {/* Fund Detail Sheet */}
      {selectedFund && (
        <FundDetailSheet
          fund={selectedFund}
          canFuel={false}
          onClose={() => setSelectedFund(null)}
        />
      )}

      {/* Settings (Appearance) Modal */}
      {settingsOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Settings"
          className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center p-0 sm:p-4"
        >
          <div
            aria-hidden="true"
            onClick={() => setSettingsOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-[20px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[20px] sm:pb-5">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Settings & Appearance</h2>
              <button
                type="button"
                aria-label="Close settings"
                onClick={() => setSettingsOpen(false)}
                className="tap-scale grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Edit Profile Modal */
function EditProfileModal({ currentUser, onClose }: { currentUser: User; onClose: () => void }) {
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [cover, setCover] = useState(currentUser.cover || photos.hills);
  const [avatar, setAvatar] = useState<string | null>(currentUser.avatar);
  const [handleError, setHandleError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await processAvatarFile(file);
      setAvatar(dataUrl);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    const cleanHandle = handle.trim().toLowerCase().replace(/^@/, "");
    if (!cleanHandle) {
      setHandleError("Handle cannot be empty");
      return;
    }
    if (!/^[a-z0-9_.]+$/.test(cleanHandle)) {
      setHandleError("Only letters, numbers, dots and underscores are allowed");
      return;
    }
    if (cleanHandle.length < 3) {
      setHandleError("Handle must be at least 3 characters");
      return;
    }

    updateCurrentUser({
      name: name.trim() || "Roamer",
      handle: cleanHandle,
      bio: bio.trim(),
      cover,
      avatar,
    });
    toast.success("Profile updated");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
      className="fixed inset-0 z-[1300] flex items-end justify-center sm:items-center p-0 sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[24px] sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="tap-scale grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {/* Avatar picker */}
          <div className="flex items-center gap-3.5 rounded-[16px] border border-border bg-muted/40 p-3">
            <Avatar name={name || "Roamer"} src={avatar} className="size-14 ring-2 ring-border" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground">Profile Picture</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="tap-scale inline-flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground"
                >
                  <Upload size={12} />
                  <span>{avatar ? "Change" : "Upload"}</span>
                </button>
                {avatar && (
                  <button
                    type="button"
                    onClick={() => setAvatar(null)}
                    className="tap-scale inline-flex h-7 items-center gap-1 rounded-full border border-border bg-background px-2.5 text-[11px] font-medium text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarPick}
                className="hidden"
              />
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Handle */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Handle
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3.5 top-2.5 text-sm text-muted-foreground">@</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => {
                  setHandle(e.target.value);
                  setHandleError("");
                }}
                placeholder="username"
                className="w-full rounded-xl border border-input bg-muted pl-8 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
              />
            </div>
            {handleError && <p className="mt-1 text-xs text-destructive">{handleError}</p>}
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Bio
              </label>
              <span className="font-mono text-[10px] text-muted-foreground">{bio.length}/120</span>
            </div>
            <textarea
              rows={3}
              maxLength={120}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other roamers about your journeys…"
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Cover Picker (4 travel presets) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Choose Cover
            </label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PRESET_COVERS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCover(preset.src)}
                  className={cn(
                    "tap-scale relative aspect-[4/3] overflow-hidden rounded-[10px] border transition-all",
                    cover === preset.src ? "border-primary ring-2 ring-primary" : "border-border",
                  )}
                >
                  <img src={preset.src} alt={preset.name} className="size-full object-cover" />
                  {cover === preset.src && (
                    <span className="absolute inset-0 grid place-items-center bg-black/35 text-white">
                      <Check size={16} strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="mt-6 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="tap-scale flex h-11 w-full items-center justify-center rounded-full bg-primary font-display text-sm font-normal text-primary-foreground shadow-float transition hover:bg-primary/90"
            >
              Save Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Trip Fund Create / Edit Modal */
function TripFundFormModal({ fund, onClose }: { fund: TripFund | null; onClose: () => void }) {
  const [title, setTitle] = useState(fund?.title || "");
  const [placeId, setPlaceId] = useState(fund?.placeId || places[0].id);
  const [goal, setGoal] = useState<string>(fund ? String(fund.goal) : "10000");
  const [story, setStory] = useState(fund?.story || "");
  const [endDate, setEndDate] = useState(
    fund
      ? fund.endDate.split("T")[0]
      : new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Please enter a title");
    const numGoal = parseInt(goal, 10);
    if (!numGoal || numGoal < 500) return toast.error("Minimum goal is ₹500");
    if (!story.trim()) return toast.error("Please enter a brief story or plan");

    const selectedPlace = places.find((p) => p.id === placeId);
    const cover = selectedPlace?.image || photos.hills;

    if (fund) {
      updateTripFund(fund.id, {
        title: title.trim(),
        placeId,
        goal: numGoal,
        story: story.trim(),
        endDate: new Date(endDate).toISOString(),
        cover,
      });
      toast.success("Trip fund updated");
    } else {
      createTripFund({
        title: title.trim(),
        placeId,
        goal: numGoal,
        story: story.trim(),
        endDate: new Date(endDate).toISOString(),
        cover,
      });
      toast.success("Trip fund created 🎉");
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trip Fund Form"
      className="fixed inset-0 z-[1300] flex items-end justify-center sm:items-center p-0 sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      />

      <div className="relative z-10 max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[24px] sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {fund ? "Edit Trip Fund" : "New Trip Fund"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="tap-scale grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Fund Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spiti Valley High Passes Exploration"
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Destination
            </label>
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  📍 {p.name}, {p.region}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Target Goal (₹, min 500)
            </label>
            <input
              type="number"
              min="500"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="10000"
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm font-display font-normal text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Story / Plan (Max 200 chars)
              </label>
              <span className="font-mono text-[10px] text-muted-foreground">
                {story.length}/200
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={200}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Share what this trip is about and what dispatches backers will receive…"
              className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2 text-sm text-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="tap-scale flex h-11 w-full items-center justify-center rounded-full bg-teal font-display text-sm font-normal text-white shadow-float transition hover:brightness-105"
            >
              {fund ? "Save Changes" : "Launch Trip Fund"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
