import { ArrowBigUp, ArrowBigDown, MessageCircle, Share2 } from "lucide-react";
import { formatCount, type Post } from "@/lib/data";
import { useStore, votePost } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ActionStack({ post, size = "md" }: { post: Post; size?: "md" | "lg" }) {
  const s = useStore();
  const v = s.votes[post.id] ?? 0;
  const icon = size === "lg" ? 30 : 24;
  const upCount = formatCount(post.upvotes + (v === 1 ? 1 : 0));

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-label={`Pwoli upvote (${upCount})`}
        aria-pressed={v === 1}
        onClick={() => votePost(post.id, 1)}
        className="tap-scale group flex flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid size-10 place-items-center rounded-full transition-all duration-200 group-hover:scale-105",
            v === 1
              ? "animate-vote-bounce bg-primary text-primary-foreground shadow-float ring-2 ring-on-media/40"
              : "glass hover:bg-on-media/25",
          )}
        >
          <ArrowBigUp
            size={icon}
            fill={v === 1 ? "currentColor" : "none"}
            className="transition-transform duration-200"
          />
        </span>
        <span className="text-xs font-medium drop-shadow-sm">
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
            "grid size-10 place-items-center rounded-full transition-all duration-200 group-hover:scale-105",
            v === -1
              ? "animate-vote-bounce bg-destructive text-destructive-foreground shadow-card ring-2 ring-on-media/40"
              : "glass hover:bg-on-media/25",
          )}
        >
          <ArrowBigDown
            size={icon}
            fill={v === -1 ? "currentColor" : "none"}
            className="transition-transform duration-200"
          />
        </span>
        <span className="text-xs font-medium drop-shadow-sm">Waste</span>
      </button>

      <button
        type="button"
        aria-label={`Comments (${formatCount(post.comments)})`}
        onClick={() => toast("Comments coming soon")}
        className="tap-scale group flex flex-col items-center gap-1 text-on-media"
      >
        <span className="grid size-10 place-items-center rounded-full glass transition-all duration-150 group-hover:bg-on-media/25">
          <MessageCircle size={icon - 4} />
        </span>
        <span className="text-xs font-medium tabular-nums drop-shadow-sm">
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
        <span className="grid size-10 place-items-center rounded-full glass transition-all duration-150 group-hover:bg-on-media/25">
          <Share2 size={icon - 4} />
        </span>
        <span className="text-xs font-medium tabular-nums drop-shadow-sm">
          {formatCount(post.shares)}
        </span>
      </button>
    </div>
  );
}
