import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, Send, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { openCommentsModal, openShareModal, submitComment, useStore } from "@/lib/store";
import { places } from "@/lib/data";
import { Avatar } from "./Avatar";

export function CommentsDrawer() {
  const s = useStore();
  const postId = s.activeCommentPostId;
  const [text, setText] = useState("");
  const [author, setAuthor] = useState(s.currentUser.handle || "you.roamer");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (s.currentUser.handle) {
      setAuthor(s.currentUser.handle);
    }
  }, [s.currentUser.handle]);

  if (!postId) return null;

  const comments = s.commentsByPost[postId] ?? [];
  const targetPost = [...s.posts, ...s.reels].find((p) => p.id === postId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await submitComment(postId, text.trim(), author.trim() || s.currentUser.handle);
      setText("");
      toast.success("Comment posted!");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
      className="fixed inset-0 z-[1250] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div aria-hidden="true" onClick={() => openCommentsModal(null)} className="fixed inset-0" />
      <div className="relative z-10 flex max-h-[82vh] w-full max-w-md flex-col rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.25rem)] shadow-card sm:rounded-[24px] sm:pb-5">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={17} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Comments ({targetPost?.comments ?? comments.length})
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close comments"
            onClick={() => openCommentsModal(null)}
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="my-3 flex-1 space-y-3 overflow-y-auto pr-1">
          {comments.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No comments yet. Drop the first vibe!
            </p>
          ) : (
            comments.map((cm) => (
              <div
                key={cm.id}
                className="flex items-start gap-2.5 rounded-[14px] bg-muted/45 p-2.5"
              >
                <Avatar name={cm.author} className="size-7 shrink-0 text-[10px]" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground">@{cm.author}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{cm.body}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend} className="mt-1 space-y-2 border-t border-border pt-3">
          <div className="flex items-center gap-2">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your handle"
              aria-label="Your handle"
              className="w-28 shrink-0 rounded-full border border-input bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              aria-label="Add a comment"
              className="min-w-0 flex-1 rounded-full border border-input bg-muted px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
              aria-label="Post comment"
              disabled={sending || !text.trim()}
              className="tap-scale grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-45"
            >
              <Send size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ShareDrawer() {
  const s = useStore();
  const postId = s.activeSharePostId;
  const [copied, setCopied] = useState(false);

  if (!postId) return null;

  const targetPost = [...s.posts, ...s.reels].find((p) => p.id === postId);
  const place = places.find((pl) => pl.id === targetPost?.placeId);
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/place/${targetPost?.placeId ?? "alleppey"}`
      : `/place/${targetPost?.placeId ?? "alleppey"}`;
  const shareText = targetPost
    ? `${targetPost.caption} — via @${targetPost.creator} on Roam Machu`
    : "Check out this roam on Roam Machu!";

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 1800);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: place ? `${place.name} — Roam Machu` : "Roam Machu",
          text: shareText,
          url: shareUrl,
        });
        openShareModal(null);
      } catch {
        /* user cancelled */
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share roam"
      className="fixed inset-0 z-[1250] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div aria-hidden="true" onClick={() => openShareModal(null)} className="fixed inset-0" />
      <div className="relative z-10 w-full max-w-md rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.25rem)] shadow-card sm:rounded-[24px] sm:pb-5">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Share2 size={17} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">Share Roam</h2>
          </div>
          <button
            type="button"
            aria-label="Close share sheet"
            onClick={() => openShareModal(null)}
            className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {targetPost && (
          <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-muted/50 p-2.5">
            <img
              src={targetPost.image}
              alt={targetPost.caption}
              className="size-12 shrink-0 rounded-[10px] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {place?.name ?? "Roam Machu"} · @{targetPost.creator}
              </p>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {targetPost.caption}
              </p>
            </div>
          </div>
        )}

        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="tap-scale flex flex-col items-center justify-center gap-1.5 rounded-[14px] border border-border bg-muted/40 py-3 text-xs font-medium text-foreground hover:bg-muted"
          >
            {copied ? <Check size={17} className="text-teal" /> : <Copy size={17} />}
            <span>{copied ? "Copied" : "Copy link"}</span>
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => openShareModal(null)}
            className="tap-scale flex flex-col items-center justify-center gap-1.5 rounded-[14px] border border-border bg-muted/40 py-3 text-xs font-medium text-foreground hover:bg-muted"
          >
            <ExternalLink size={17} />
            <span>WhatsApp</span>
          </a>

          <button
            type="button"
            onClick={handleNativeShare}
            className="tap-scale flex flex-col items-center justify-center gap-1.5 rounded-[14px] border border-border bg-muted/40 py-3 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Share2 size={17} />
            <span>More…</span>
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2">
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
            {shareUrl}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="tap-scale shrink-0 rounded-full bg-primary px-3 py-1 font-display text-[11px] font-normal text-primary-foreground"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
