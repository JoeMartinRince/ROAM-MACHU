import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  MapPin,
  Plus,
  Send,
  Upload,
  UserPlus,
  UserCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { formatCount, places } from "@/lib/data";
import {
  addStory,
  getCreatorByHandle,
  isFollowing,
  toggleFollow,
  useStore,
  viewStory,
} from "@/lib/store";
import { uploadMediaToSupabase, type Story } from "@/lib/supabase";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";

export function StoryBar() {
  const s = useStore();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Create Story form state
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [placeId, setPlaceId] = useState(places[0]!.id);
  const [caption, setCaption] = useState("");
  const [authorName, setAuthorName] = useState(s.currentUser.name);
  const [authorHandle, setAuthorHandle] = useState(s.currentUser.handle);
  const [uploading, setUploading] = useState(false);

  const stories = s.stories;
  const activeStory: Story | undefined = activeIdx !== null ? stories[activeIdx] : undefined;
  const activeStoryId = activeStory?.id;

  useEffect(() => {
    setAuthorName(s.currentUser.name);
    setAuthorHandle(s.currentUser.handle);
  }, [s.currentUser.name, s.currentUser.handle]);

  useEffect(() => {
    if (activeStoryId) {
      viewStory(activeStoryId);
    }
  }, [activeStoryId]);

  useEffect(() => {
    if (activeIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveIdx(null);
      } else if (e.key === "ArrowLeft" && activeIdx > 0) {
        setActiveIdx(activeIdx - 1);
      } else if (e.key === "ArrowRight" && activeIdx < stories.length - 1) {
        setActiveIdx(activeIdx + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIdx, stories.length]);

  const onFilePick = (f?: File) => {
    if (!f) return;
    setFile(f);
    setIsVideo(f.type.startsWith("video"));
    setPreview(URL.createObjectURL(f));
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const place = places.find((p) => p.id === placeId) ?? places[0]!;
      const mediaUrl = file ? await uploadMediaToSupabase(file) : place.image;
      const newStory: Story = {
        id: `st_${Date.now()}`,
        creator: authorHandle.trim() || s.currentUser.handle,
        creatorName: authorName.trim() || s.currentUser.name,
        placeId,
        caption: caption.trim() || `Live from ${place.name} ✨`,
        mediaUrl,
        mediaType: isVideo ? "video" : "image",
        views: 1,
        createdAt: new Date().toISOString(),
      };
      addStory(newStory);
      toast.success("Story published!");
      setCreateOpen(false);
      setFile(null);
      setPreview(null);
      setCaption("");
      setActiveIdx(0);
    } catch {
      toast.error("Could not upload story");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="no-scrollbar -mx-4 mt-2.5 flex items-start gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:mt-0 lg:gap-4 lg:px-0">
        {/* + Add trip button */}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="tap-scale flex w-15 shrink-0 flex-col items-center gap-1 lg:w-16 lg:gap-1.5"
        >
          <span className="relative grid size-14 place-items-center rounded-full border border-dashed border-border bg-muted p-[2px] transition-colors hover:border-primary/50 lg:size-16">
            <Avatar
              name={s.currentUser.name}
              src={s.currentUser.avatar}
              className="size-full text-xs font-semibold ring-0"
            />
            <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs ring-2 ring-background lg:size-5.5">
              <Plus size={13} strokeWidth={2.5} />
            </span>
          </span>
          <span className="w-full truncate text-center text-xs font-medium text-foreground/90">
            Add trip
          </span>
        </button>

        {/* Story circles */}
        {stories.map((st, idx) => {
          const creatorInfo = getCreatorByHandle(st.creator);
          const isLive = creatorInfo?.live ?? idx < 3;
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className="tap-scale flex w-15 shrink-0 flex-col items-center gap-1 lg:w-16 lg:gap-1.5"
            >
              <span
                className={
                  isLive
                    ? "relative grid size-14 place-items-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-primary p-[2px] lg:size-16"
                    : "relative grid size-14 place-items-center rounded-full bg-primary/75 p-[2px] lg:size-16"
                }
              >
                <span className="grid size-full overflow-hidden place-items-center rounded-full bg-background p-[2px]">
                  {st.mediaUrl && st.mediaType === "image" ? (
                    <img
                      src={st.mediaUrl}
                      alt={st.creatorName}
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <Avatar
                      name={st.creatorName}
                      src={creatorInfo?.avatar}
                      className="size-full text-xs font-semibold ring-0"
                    />
                  )}
                </span>
              </span>
              <span className="w-full truncate text-center text-xs font-medium text-foreground/90">
                {st.creatorName.split(" ")[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Full-screen Story Viewer Modal */}
      {activeStory && activeIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Story viewer"
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/90 p-0 sm:p-4 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative flex h-full w-full max-w-[420px] flex-col overflow-hidden bg-black sm:h-[86vh] sm:rounded-[24px] sm:ring-1 sm:ring-white/15">
            {/* Progress bars */}
            <div className="absolute inset-x-3 top-3 z-20 flex gap-1.5">
              {stories.map((st, i) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
                >
                  <div
                    className={cn(
                      "h-full rounded-full bg-white transition-all duration-300",
                      i <= activeIdx ? "w-full" : "w-0",
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Header: Creator + Follow button + Close */}
            <div className="absolute inset-x-3 top-6 z-20 flex items-center justify-between gap-2 pt-1">
              <Link
                to="/u/$handle"
                params={{ handle: activeStory.creator }}
                onClick={() => setActiveIdx(null)}
                className="flex min-w-0 items-center gap-2.5"
              >
                <Avatar
                  name={activeStory.creatorName}
                  src={getCreatorByHandle(activeStory.creator)?.avatar}
                  className="size-9 text-xs ring-2 ring-white/80"
                />
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-semibold text-white drop-shadow-xs">
                    {activeStory.creatorName}
                  </p>
                  <p className="truncate text-[11px] text-white/75">@{activeStory.creator}</p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                {activeStory.creator.toLowerCase() !== s.currentUser.handle.toLowerCase() &&
                  (() => {
                    const following = isFollowing(activeStory.creator);
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          const next = toggleFollow(activeStory.creator);
                          toast.success(
                            next
                              ? `Following @${activeStory.creator}`
                              : `Unfollowed @${activeStory.creator}`,
                          );
                        }}
                        className={cn(
                          "tap-scale inline-flex items-center gap-1 rounded-full px-3 py-1 font-display text-xs font-normal transition",
                          following
                            ? "bg-white/20 text-white backdrop-blur-md"
                            : "bg-primary text-primary-foreground shadow-sm",
                        )}
                      >
                        {following ? <UserCheck size={13} /> : <UserPlus size={13} />}
                        <span>{following ? "Following" : "Follow"}</span>
                      </button>
                    );
                  })()}
                <button
                  type="button"
                  aria-label="Close story"
                  onClick={() => setActiveIdx(null)}
                  className="grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md hover:bg-black/70"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Story Media */}
            <div className="relative flex-1 bg-zinc-950">
              {activeStory.mediaType === "video" && activeStory.mediaUrl ? (
                <video
                  src={activeStory.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  className="size-full object-cover"
                />
              ) : (
                <img
                  src={
                    activeStory.mediaUrl ?? places.find((p) => p.id === activeStory.placeId)?.image
                  }
                  alt={activeStory.caption}
                  className="size-full object-cover"
                />
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />

              {activeIdx > 0 && (
                <button
                  type="button"
                  aria-label="Previous story"
                  onClick={() => setActiveIdx(activeIdx - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/65"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              {activeIdx < stories.length - 1 && (
                <button
                  type="button"
                  aria-label="Next story"
                  onClick={() => setActiveIdx(activeIdx + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 grid size-9 place-items-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/65"
                >
                  <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Footer caption + Place badge + Views */}
            <div className="absolute inset-x-0 bottom-0 z-20 space-y-2.5 p-4 text-white">
              <p className="text-sm font-medium leading-snug drop-shadow-xs">
                {activeStory.caption}
              </p>
              <div className="flex items-center justify-between gap-2">
                {(() => {
                  const pl = places.find((x) => x.id === activeStory.placeId);
                  if (!pl) return <span />;
                  return (
                    <Link
                      to="/place/$id"
                      params={{ id: pl.id }}
                      onClick={() => setActiveIdx(null)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/30"
                    >
                      <MapPin size={12} />
                      <span>{pl.name}</span>
                    </Link>
                  );
                })()}
                <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 font-mono text-[11px] font-medium text-white/90 tabular-nums">
                  <Eye size={13} />
                  {formatCount(activeStory.views)} views
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {createOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add story"
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <form
            onSubmit={handleCreateStory}
            className="w-full max-w-md rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.25rem)] shadow-card sm:rounded-[24px] sm:pb-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-normal text-foreground">
                  Add Travel Story
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Database size={10} /> Neon DB
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <label className="mt-3.5 flex aspect-[16/10] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[16px] border-2 border-dashed border-border bg-muted/40 transition hover:bg-muted/70">
              {preview ? (
                isVideo ? (
                  <video src={preview} controls className="size-full object-cover" />
                ) : (
                  <img src={preview} alt="Story preview" className="size-full object-cover" />
                )
              ) : (
                <div className="flex flex-col items-center gap-1.5 p-4 text-center">
                  <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                    <Upload size={18} />
                  </span>
                  <p className="text-xs font-semibold text-foreground">
                    Upload Story Photo or Video
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Or leave blank to use the selected place cover photo
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => onFilePick(e.target.files?.[0])}
              />
            </label>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Your Name
                </label>
                <input
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Anu Joseph"
                  className="w-full rounded-[12px] border border-input bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Handle
                </label>
                <input
                  value={authorHandle}
                  onChange={(e) => setAuthorHandle(e.target.value)}
                  placeholder="chai.nomad"
                  className="w-full rounded-[12px] border border-input bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-2.5">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                Place Tag
              </label>
              <select
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                className="w-full rounded-[12px] border border-input bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              >
                {places.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.region})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2.5">
              <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                Story Caption
              </label>
              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's the vibe right now? ✨"
                className="w-full rounded-[12px] border border-input bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="tap-scale mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 font-display text-sm font-normal text-primary-foreground shadow-float transition hover:bg-primary/90 disabled:opacity-50"
            >
              <Send size={15} />
              <span>{uploading ? "Saving to Neon DB..." : "Share to Story"}</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
