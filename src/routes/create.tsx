import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { places } from "@/lib/data";
import { addPost } from "@/lib/store";
import { cn } from "@/lib/utils";

export const MAX_VIDEO_BYTES = 20 * 1024 * 1024;

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Share a trip — Roam Machu" },
      {
        name: "description",
        content: "Upload a travel photo or video, tag a place and share your roam.",
      },
      { property: "og:title", content: "Share a trip — Roam Machu" },
      { property: "og:description", content: "Upload a travel photo or video and tag a place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Create,
});

function Create() {
  const nav = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [placeId, setPlaceId] = useState(places[0].id);
  const [caption, setCaption] = useState("");
  const [anon, setAnon] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const s = useStore();
  const isVideo = !!file?.type.startsWith("video");

  const pick = (f?: File) => {
    if (!f) return;
    if (f.type.startsWith("video") && f.size > MAX_VIDEO_BYTES)
      return toast.error("Videos must be 20 MB or less");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = () => {
    if (!file || !preview) return toast.error("Add a photo or video first");
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        const n = Math.min(100, (p ?? 0) + 8 + Math.round(Math.random() * 10));
        if (n >= 100) {
          clearInterval(t);
          addPost(
            {
              id: `u${Date.now()}`,
              creator: anon.trim() || s.currentUser.handle,
              placeId,
              caption: caption || "New roam ✨",
              image: isVideo ? undefined : preview,
              video: isVideo ? preview : undefined,
              upvotes: 0,
              downvotes: 0,
              comments: 0,
              shares: 0,
              views: 0,
            },
            isVideo,
          );
          toast.success("Posted!");
          setTimeout(() => nav({ to: isVideo ? "/reels" : "/" }), 300);
        }
        return n;
      });
    }, 150);
  };

  const field =
    "w-full rounded-[16px] border border-input bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring";
  return (
    <div className="px-4 pb-2 pt-[calc(var(--safe-top)+0.75rem)] lg:px-8 lg:py-10">
      <div className="lg:mx-auto lg:max-w-[560px] lg:rounded-[20px] lg:border lg:border-border lg:bg-card lg:p-7 lg:shadow-card">
        <h1 className="font-display text-[22px] font-normal text-foreground">Share a roam</h1>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "relative mt-3 grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-[20px] border border-dashed bg-muted/60 transition-colors lg:mt-4 lg:aspect-[16/10]",
            dragging ? "border-primary bg-muted" : "border-border hover:border-foreground/30",
          )}
        >
          {preview ? (
            isVideo ? (
              <video
                src={preview}
                className="absolute inset-0 size-full object-cover"
                muted
                autoPlay
                loop
                playsInline
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 size-full object-cover"
              />
            )
          ) : (
            <div className="flex flex-col items-center px-4 text-center">
              <span className="grid size-12 place-items-center rounded-full border border-border bg-background text-foreground shadow-2xs">
                <ImagePlus size={22} />
              </span>
              <p className="mt-2.5 text-base font-semibold text-foreground">Add a photo or video</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tap to browse or drag & drop · Videos up to 20 MB
              </p>
              <div className="mt-4 flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="tap-scale inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground shadow-2xs transition hover:bg-muted"
                >
                  <Camera size={14} className="text-muted-foreground" />
                  <span>Camera</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    galleryInputRef.current?.click();
                  }}
                  className="tap-scale inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground shadow-2xs transition hover:bg-muted"
                >
                  <ImagePlus size={14} className="text-muted-foreground" />
                  <span>Gallery</span>
                </button>
              </div>
            </div>
          )}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {preview && (
            <button
              type="button"
              aria-label="Remove media"
              onClick={(e) => {
                e.preventDefault();
                setFile(null);
                setPreview(undefined);
              }}
              className="tap-scale absolute right-3 top-3 grid size-9 place-items-center rounded-full border border-border bg-card/90 text-foreground shadow-card backdrop-blur-md"
            >
              <X size={16} />
            </button>
          )}
        </label>

        <div className="mt-3.5 space-y-3">
          <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            <select
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              className={field}
              aria-label="Place"
            >
              {places.map((p) => (
                <option key={p.id} value={p.id} className="bg-popover text-popover-foreground">
                  📍 {p.name}, {p.region}
                </option>
              ))}
            </select>
            <input
              value={anon}
              onChange={(e) => setAnon(e.target.value)}
              placeholder="Anonymous name (optional)"
              aria-label="Anonymous name"
              className={field}
            />
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            aria-label="Caption"
            rows={3}
            className={field}
          />
        </div>

        {progress !== null && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1 text-right text-xs text-muted-foreground">Uploading {progress}%</p>
          </div>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={progress !== null}
          className="tap-scale mt-4 flex h-11 w-full items-center justify-center rounded-full bg-primary font-display text-sm font-normal text-primary-foreground shadow-float transition hover:bg-primary/90 disabled:opacity-60"
        >
          Post
        </button>
      </div>
    </div>
  );
}
