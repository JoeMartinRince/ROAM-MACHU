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
      className="tap-scale inline-flex max-w-full items-center gap-1 rounded-full glass px-3 py-1 text-xs font-medium text-on-media hover:bg-on-media/25"
    >
      <MapPin size={12} className="shrink-0" />
      <span className="truncate">{p.name}</span>
    </Link>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-card p-4 shadow-card">
      <Skeleton className="absolute inset-0 size-full rounded-none" />
      <div className="absolute bottom-4 right-3 flex flex-col items-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="size-10 rounded-full bg-muted/80" />
            <Skeleton className="h-3 w-8 rounded-full bg-muted/80" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4 right-20 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="size-9 rounded-full bg-muted/80" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-full bg-muted/80" />
            <Skeleton className="h-3 w-20 rounded-full bg-muted/80" />
          </div>
        </div>
        <Skeleton className="h-3.5 w-4/5 rounded-full bg-muted/80" />
        <Skeleton className="h-6 w-32 rounded-full bg-muted/80" />
      </div>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  const c = creators.find((x) => x.handle === post.creator);
  const [loaded, setLoaded] = useState(false);

  return (
    <article className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-card shadow-card ring-1 ring-border/40">
      {!loaded && <Skeleton className="absolute inset-0 size-full rounded-none" />}
      <img
        src={post.image}
        alt={post.caption}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 size-full object-cover transition-opacity duration-300"
      />
      <div className="absolute inset-0 bg-media-fade" />
      <div className="absolute bottom-4 right-3">
        <ActionStack post={post} />
      </div>
      <div className="absolute bottom-4 left-4 right-20 space-y-2 text-on-media">
        <div className="flex items-center gap-2">
          <Avatar name={c?.name ?? post.creator} className="size-9 text-xs ring-2 ring-on-media" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{c?.name ?? "Anonymous roamer"}</p>
            <p className="truncate text-xs opacity-85">@{post.creator}</p>
          </div>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed">{post.caption}</p>
        <PlaceTag placeId={post.placeId} />
      </div>
    </article>
  );
}
