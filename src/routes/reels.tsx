import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { type Post } from "@/lib/data";
import { getCreatorByHandle, useStore } from "@/lib/store";
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

function Reel({
  post,
  index,
  onActive,
}: {
  post: Post;
  index: number;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current!;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          onActive(index);
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [index, onActive]);
  const c = getCreatorByHandle(post.creator);

  return (
    <section
      data-reel-index={index}
      className="relative h-dvh snap-start snap-always bg-navy lg:flex lg:items-center lg:justify-center lg:gap-5 lg:bg-background lg:py-6"
    >
      {/* 9:16 Video Player container (full screen on mobile, 420px tall card on desktop) */}
      <div className="relative size-full overflow-hidden bg-navy lg:h-[min(88dvh,780px)] lg:w-[420px] lg:shrink-0 lg:rounded-[20px] lg:shadow-card lg:ring-1 lg:ring-border/70">
        <video
          ref={ref}
          src={post.video}
          poster={post.image}
          muted
          loop
          playsInline
          className="absolute inset-0 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-42% to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-black/95 via-black/70 to-transparent"
        />
        <div className="absolute bottom-[calc(var(--safe-bottom)+5.5rem)] left-4 right-20 space-y-1.5 text-on-media lg:bottom-5 lg:left-5 lg:right-5">
          <Link
            to="/u/$handle"
            params={{ handle: post.creator }}
            className="tap-scale flex items-center gap-2.5"
          >
            <Avatar
              name={c?.name ?? post.creator}
              src={c?.avatar}
              className="size-9 text-xs ring-2 ring-white/85 shadow-xs"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold leading-tight text-white drop-shadow-xs">
                {c?.name ?? post.creator}
              </p>
              <p className="truncate text-xs font-normal leading-tight text-white/75">
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
      </div>

      {/* Action stack: overlay on mobile aligned with caption bottom, to the right of the 9:16 player on desktop */}
      <div className="absolute bottom-[calc(var(--safe-bottom)+5.5rem)] right-3.5 z-10 lg:static lg:self-end lg:pb-4">
        <ActionStack post={post} size="lg" />
      </div>
    </section>
  );
}

function Reels() {
  const { reels } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback(
    (nextIdx: number) => {
      const clamped = Math.max(0, Math.min(reels.length - 1, nextIdx));
      const container = containerRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(`[data-reel-index="${clamped}"]`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveIndex(clamped);
      }
    },
    [reels.length],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, scrollToIndex]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="no-scrollbar h-dvh snap-y snap-mandatory overflow-y-auto scroll-smooth overscroll-y-contain"
      >
        {reels.map((r, idx) => (
          <Reel key={r.id} post={r} index={idx} onActive={setActiveIndex} />
        ))}
      </div>

      {/* Desktop up/down reel navigation buttons */}
      <div className="hidden lg:fixed lg:right-8 lg:top-1/2 lg:z-20 lg:flex lg:-translate-y-1/2 lg:flex-col lg:items-center lg:gap-3">
        <button
          type="button"
          aria-label="Previous reel"
          disabled={activeIndex <= 0}
          onClick={() => scrollToIndex(activeIndex - 1)}
          className="tap-scale grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronUp size={20} />
        </button>
        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
          {activeIndex + 1} / {reels.length}
        </span>
        <button
          type="button"
          aria-label="Next reel"
          disabled={activeIndex >= reels.length - 1}
          onClick={() => scrollToIndex(activeIndex + 1)}
          className="tap-scale grid size-11 place-items-center rounded-full border border-border bg-card text-foreground shadow-card transition hover:bg-muted disabled:opacity-40"
        >
          <ChevronDown size={20} />
        </button>
      </div>
    </div>
  );
}
