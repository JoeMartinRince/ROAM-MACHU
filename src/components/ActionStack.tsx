import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from "lucide-react";
import { formatCount, type Post } from "@/lib/data";
import { useStore, votePost } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ActionStack({ post, size = "md" }: { post: Post; size?: "md" | "lg" }) {
  const s = useStore();
  const v = s.votes[post.id] ?? 0;
  const isLg = size === "lg";
  const voteIconSize = isLg ? 21 : 18;
  const subIconSize = isLg ? 18 : 16;
  const circleClass = isLg ? "size-10 lg:size-11" : "size-9";
  const idleSurface = isLg
    ? "bg-black/30 backdrop-blur-md hover:bg-black/45 lg:border lg:border-border lg:bg-card lg:text-foreground lg:shadow-card lg:hover:bg-muted"
    : "bg-black/30 backdrop-blur-md hover:bg-black/45";
  const labelColor = isLg
    ? "text-white/95 drop-shadow-xs lg:text-foreground lg:drop-shadow-none"
    : "text-white/95 drop-shadow-xs";
  const upCount = formatCount(post.upvotes + (v === 1 ? 1 : 0));

  return (
    <div
      className={cn(
        "flex w-14 shrink-0 flex-col items-center",
        isLg ? "gap-2.5 lg:gap-3.5" : "gap-2",
      )}
    >
      <button
        type="button"
        aria-label={`Pwoli upvote (${upCount})`}
        aria-pressed={v === 1}
        onClick={() => votePost(post.id, 1)}
        className="tap-scale group flex w-full flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-200 group-hover:scale-105",
            circleClass,
            v === 1
              ? "animate-vote-bounce bg-primary text-primary-foreground shadow-float"
              : idleSurface,
          )}
        >
          <ArrowBigUp
            size={voteIconSize}
            fill={v === 1 ? "currentColor" : "none"}
            className="transition-transform duration-200"
          />
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-semibold font-display whitespace-nowrap",
            labelColor,
          )}
        >
          Pwoli{" "}
          <span
            key={v}
            className="inline-block animate-count-pop font-display font-semibold tabular-nums"
          >
            {upCount}
          </span>
        </span>
      </button>

      <button
        type="button"
        aria-label="Waste downvote"
        aria-pressed={v === -1}
        onClick={() => votePost(post.id, -1)}
        className="tap-scale group flex w-full flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-200 group-hover:scale-105",
            circleClass,
            v === -1
              ? "animate-vote-bounce bg-destructive text-destructive-foreground shadow-card"
              : idleSurface,
          )}
        >
          <ArrowBigDown
            size={voteIconSize}
            fill={v === -1 ? "currentColor" : "none"}
            className="transition-transform duration-200"
          />
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-semibold font-display",
            labelColor,
          )}
        >
          Waste
        </span>
      </button>

      <button
        type="button"
        aria-label={`Comments (${formatCount(post.comments)})`}
        onClick={() => toast("Comments coming soon")}
        className="tap-scale group flex w-full flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-150",
            circleClass,
            idleSurface,
          )}
        >
          <MessageCircle size={subIconSize} />
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-semibold font-display tabular-nums",
            labelColor,
          )}
        >
          {formatCount(post.comments)}
        </span>
      </button>

      <button
        type="button"
        aria-label={`Share (${formatCount(post.shares)})`}
        onClick={() => {
          navigator.clipboard?.writeText(window.location.origin + "/place/" + post.placeId);
          toast.success("Link copied");
        }}
        className="tap-scale group flex w-full flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-150",
            circleClass,
            idleSurface,
          )}
        >
          <Share2 size={subIconSize} />
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-semibold font-display tabular-nums",
            labelColor,
          )}
        >
          {formatCount(post.shares)}
        </span>
      </button>
    </div>
  );
}
