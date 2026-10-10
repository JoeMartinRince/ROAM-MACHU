import { useState } from "react";
import { Database, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { openCommentsModal, submitComment, useStore } from "@/lib/store";
import { Avatar } from "./Avatar";

export function CommentsDrawer() {
  const s = useStore();
  const postId = s.activeCommentPostId;
  const [text, setText] = useState("");
  const [author, setAuthor] = useState("you.roamer");
  const [sending, setSending] = useState(false);

  if (!postId) return null;

  const comments = s.commentsByPost[postId] ?? [];
  const targetPost = [...s.posts, ...s.reels].find((p) => p.id === postId);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await submitComment(postId, text.trim(), author.trim() || "you.roamer");
      setText("");
      toast.success("Comment saved to Neon Database!");
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
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle size={17} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Comments ({targetPost?.comments ?? comments.length})
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Database size={10} /> Neon DB
            </span>
          </div>
          <button
            type="button"
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
              className="w-28 shrink-0 rounded-full border border-input bg-muted px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment..."
              className="min-w-0 flex-1 rounded-full border border-input bg-muted px-3.5 py-2 text-xs text-foreground outline-none focus:border-primary"
            />
            <button
              type="submit"
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
