import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { creators, places, type Post } from "@/lib/data";
import { ActionStack } from "./ActionStack";
import { Avatar } from "./Avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function PlaceTag({ placeId }: { placeId: string }) {
  const p = places.find((x) => x.id === placeId);
  if (!p) return null;
  return (
    <Link
      to="/place/$id"
      params={{ id: p.id }}
      className="tap-scale inline-flex max-w-full items-center gap-1.5 rounded-full glass px-3 py-1 text-xs font-medium text-on-media transition hover:bg-black/50"
    >
      <MapPin size={12} className="shrink-0 text-primary" />
      <span className="truncate">{p.name}</span>
    </Link>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/70 bg-card p-4 shadow-card">
      <Skeleton className="absolute inset-0 size-full rounded-none" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-full bg-muted/80" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-28 rounded-full bg-muted/80" />
              <Skeleton className="h-3 w-20 rounded-full bg-muted/80" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-4/5 rounded-full bg-muted/80" />
          <Skeleton className="h-6 w-32 rounded-full bg-muted/80" />
        </div>
        <div className="flex flex-col items-center gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="size-9 rounded-full bg-muted/80" />
              <Skeleton className="h-2.5 w-8 rounded-full bg-muted/80" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  const c = creators.find((x) => x.handle === post.creator);
  const [loaded, setLoaded] = useState(false);

  return (
    <article className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-card shadow-card ring-1 ring-border/70">
      {!loaded && <Skeleton className="absolute inset-0 size-full rounded-none" />}
      <img
        src={post.image}
        alt={post.caption}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 size-full object-cover transition-opacity duration-300"
      />
      <div className="pointer-events-none absolute inset-0 bg-media-fade" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2 text-on-media">
          <Link to="/profile" className="tap-scale inline-flex max-w-full items-center gap-2.5">
            <Avatar
              name={c?.name ?? post.creator}
              className="size-9 text-xs ring-2 ring-white/90 shadow-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-tight text-white drop-shadow-xs">
                {c?.name ?? "Anonymous roamer"}
              </p>
              <p className="truncate text-xs font-medium text-white/80 leading-tight">
                @{post.creator}
              </p>
            </div>
          </Link>
          <p className="line-clamp-2 text-xs leading-relaxed text-white/95 drop-shadow-xs">
            {post.caption}
          </p>
          <div className="pt-0.5">
            <PlaceTag placeId={post.placeId} />
          </div>
        </div>

        <div className="shrink-0">
          <ActionStack post={post} />
        </div>
      </div>
    </article>
  );
}
