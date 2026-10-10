import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { creators, type Post } from "@/lib/data";
import { useStore } from "@/lib/store";
import { ActionStack } from "@/components/ActionStack";
import { PlaceTag } from "@/components/PostCard";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/reels")({
  head: () => ({
    meta: [
      { title: "Reels — Roam Machu" },
      {
        name: "description",
        content: "Swipe through short travel videos from roamers across India.",
      },
      { property: "og:title", content: "Reels — Roam Machu" },
      {
        property: "og:description",
        content: "Swipe through short travel videos from roamers across India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reels,
});

function Reel({ post }: { post: Post }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);
  const c = creators.find((x) => x.handle === post.creator);
  return (
    <section className="relative h-dvh snap-start snap-always bg-navy">
      <video
        ref={ref}
        src={post.video}
        poster={post.image}
        muted
        loop
        playsInline
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-media-fade" />
      <div className="absolute bottom-28 right-3">
        <ActionStack post={post} size="lg" />
      </div>
      <div className="absolute bottom-28 left-4 right-20 space-y-2 text-on-media">
        <div className="flex items-center gap-2">
          <Avatar name={c?.name ?? post.creator} className="size-9 text-xs ring-2 ring-on-media" />
          <p className="text-sm font-semibold">@{post.creator}</p>
        </div>
        <p className="text-sm">{post.caption}</p>
        <PlaceTag placeId={post.placeId} />
      </div>
    </section>
  );
}

function Reels() {
  const { reels } = useStore();
  return (
    <div className="no-scrollbar -mb-28 h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth overscroll-y-contain">
      {reels.map((r) => (
        <Reel key={r.id} post={r} />
      ))}
    </div>
  );
}
