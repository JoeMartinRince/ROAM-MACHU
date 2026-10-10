import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from "lucide-react";
import { formatCount, type Post } from "@/lib/data";
import { useStore, votePost } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ActionStack({ post, size = "md" }: { post: Post; size?: "md" | "lg" }) {
  const s = useStore();
  const v = s.votes[post.id] ?? 0;
  const isLg = size === "lg";
  const voteIconSize = isLg ? 24 : 20;
  const subIconSize = isLg ? 20 : 17;
  const circleClass = isLg ? "size-11" : "size-9";
  const upCount = formatCount(post.upvotes + (v === 1 ? 1 : 0));

  return (
    <div className="flex w-13 flex-col items-center gap-2.5">
      <button
        type="button"
        aria-label={`Pwoli upvote (${upCount})`}
        aria-pressed={v === 1}
        onClick={() => votePost(post.id, 1)}
        className="tap-scale group flex flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-200 group-hover:scale-105",
            circleClass,
            v === 1
              ? "animate-vote-bounce bg-primary text-primary-foreground shadow-float ring-2 ring-white/50"
              : "glass hover:bg-black/50",
          )}
        >
          <ArrowBigUp
            size={voteIconSize}
            fill={v === 1 ? "currentColor" : "none"}
            className="transition-transform duration-200"
          />
        </span>
        <span className="text-[11px] leading-tight font-semibold whitespace-nowrap text-white drop-shadow-xs">
          Pwoli{" "}
          <span key={v} className="inline-block animate-count-pop tabular-nums">
            {upCount}
          </span>
        </span>
      </button>

      <button
        type="button"
        aria-label="Waste downvote"
        aria-pressed={v === -1}
        onClick={() => votePost(post.id, -1)}
        className="tap-scale group flex flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-200 group-hover:scale-105",
            circleClass,
            v === -1
              ? "animate-vote-bounce bg-destructive text-destructive-foreground shadow-card ring-2 ring-white/50"
              : "glass hover:bg-black/50",
          )}
        >
          <ArrowBigDown
            size={voteIconSize}
            fill={v === -1 ? "currentColor" : "none"}
            className="transition-transform duration-200"
          />
        </span>
        <span className="text-[11px] leading-tight font-semibold text-white drop-shadow-xs">
          Waste
        </span>
      </button>

      <button
        type="button"
        aria-label={`Comments (${formatCount(post.comments)})`}
        onClick={() => toast("Comments coming soon")}
        className="tap-scale group flex flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full glass transition-all duration-150 group-hover:bg-black/50",
            circleClass,
          )}
        >
          <MessageCircle size={subIconSize} />
        </span>
        <span className="text-[11px] leading-tight font-semibold text-white tabular-nums drop-shadow-xs">
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
        className="tap-scale group flex flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full glass transition-all duration-150 group-hover:bg-black/50",
            circleClass,
          )}
        >
          <Share2 size={subIconSize} />
        </span>
        <span className="text-[11px] leading-tight font-semibold text-white tabular-nums drop-shadow-xs">
          {formatCount(post.shares)}
        </span>
      </button>
    </div>
  );
}
