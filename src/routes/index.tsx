import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-header.png";
import logoDark from "@/assets/logo-dark.png";
import { creators } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { PostCard, PostCardSkeleton } from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Roam Machu — Discover travel stories" },
      {
        name: "description",
        content: "Travel-only social feed: trips, places and creators across Kerala and India.",
      },
      { property: "og:title", content: "Roam Machu — Discover travel stories" },
      {
        property: "og:description",
        content: "Travel-only social feed: trips, places and creators across Kerala and India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function TripCirclesSkeleton() {
  return (
    <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex w-16 shrink-0 flex-col items-center gap-1.5">
          <Skeleton className="size-16 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function Home() {
  const { posts } = useStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 160);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="px-4">
      <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between bg-background/75 px-4 pb-3 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] backdrop-blur-xl">
        <div aria-hidden="true" className="size-10 shrink-0" />
        <Link
          to="/"
          aria-label="Roam Machu home"
          className="tap-scale inline-flex items-center justify-center"
        >
          <img src={logo} alt="Roam Machu" className="h-[34px] w-auto object-contain dark:hidden" />
          <img
            src={logoDark}
            alt="Roam Machu"
            className="hidden h-[34px] w-auto object-contain dark:block"
          />
        </Link>
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => toast("You're all caught up on new roams!")}
          className="tap-scale relative grid size-10 shrink-0 place-items-center rounded-full border border-border/60 bg-muted/85 text-foreground backdrop-blur-md hover:bg-muted"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary" />
        </button>
      </header>

      <h1 className="mt-4 text-2xl font-semibold">Discover</h1>
      {!ready ? (
        <TripCirclesSkeleton />
      ) : (
        <div className="no-scrollbar -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
          <Link to="/create" className="tap-scale flex w-16 shrink-0 flex-col items-center gap-1.5">
            <span className="grid size-16 place-items-center rounded-full border border-border/60 bg-secondary text-primary transition-colors hover:bg-secondary/80">
              <Plus />
            </span>
            <span className="w-full truncate text-center text-xs font-medium">Add trip</span>
          </Link>
          {creators.map((c) => (
            <Link
              key={c.handle}
              to="/profile"
              className="tap-scale flex w-16 shrink-0 flex-col items-center gap-1.5"
            >
              <span className="relative rounded-full p-0.5 ring-2 ring-primary">
                <Avatar name={c.name} className="size-[58px] text-sm" />
                {c.live && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-1.5 py-0.5 text-xs leading-none font-bold text-primary-foreground shadow-sm">
                    LIVE
                  </span>
                )}
              </span>
              <span className="w-full truncate text-center text-xs">{c.name.split(" ")[0]}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {!ready
          ? Array.from({ length: 2 }).map((_, i) => <PostCardSkeleton key={i} />)
          : posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
