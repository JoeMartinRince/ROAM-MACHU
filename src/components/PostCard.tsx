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
      className="tap-scale inline-flex max-w-full items-center gap-1.5 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-on-media backdrop-blur-md transition hover:bg-black/50"
    >
      <MapPin size={12} className="shrink-0 text-white/85" />
      <span className="truncate">{p.name}</span>
    </Link>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="relative aspect-[10/11] overflow-hidden rounded-[20px] border border-border/70 bg-card p-3.5 shadow-card sm:p-4 lg:aspect-[4/5]">
      <Skeleton className="absolute inset-0 size-full rounded-none" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3.5 sm:p-4">
        <div className="min-w-0 flex-1 space-y-2">
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
        <div className="flex w-14 flex-col items-center gap-2">
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
    <article className="relative aspect-[10/11] overflow-hidden rounded-[20px] bg-card shadow-card ring-1 ring-border/70 lg:aspect-[4/5]">
      {!loaded && <Skeleton className="absolute inset-0 size-full rounded-none" />}
      <img
        src={post.image}
        alt={post.caption}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 size-full object-cover transition-opacity duration-300"
      />
      <div className="pointer-events-none absolute inset-0 bg-media-fade" />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2.5 p-3.5 sm:p-4">
        <div className="min-w-0 flex-1 space-y-1.5 text-on-media">
          <Link to="/profile" className="tap-scale inline-flex max-w-full items-center gap-2.5">
            <Avatar
              name={c?.name ?? post.creator}
              className="size-9 text-xs ring-2 ring-white/85 shadow-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold leading-tight text-white drop-shadow-xs">
                {c?.name ?? "Anonymous roamer"}
              </p>
              <p className="truncate text-xs font-normal leading-tight text-white/75">
                @{post.creator}
              </p>
            </div>
          </Link>
          <p className="line-clamp-2 text-xs leading-relaxed text-white/90 drop-shadow-xs">
            {post.caption}
          </p>
          <div className="pt-0.5">
            <PlaceTag placeId={post.placeId} />
          </div>
        </div>

        <ActionStack post={post} />
      </div>
    </article>
  );
}
