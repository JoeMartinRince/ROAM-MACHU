import type { Post } from "./data";

export type Story = {
  id: string;
  creator: string;
  creatorName: string;
  placeId: string;
  caption: string;
  mediaUrl?: string;
  mediaType: "image" | "video";
  views: number;
  createdAt?: string;
};

export type CreatorStats = {
  handle: string;
  name: string;
  live: boolean;
  followersCount: number;
  isFollowing: boolean;
  tripsFunded: number;
  raisedAmount: number;
  goalAmount: number;
};

export type CommentItem = {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: string;
};

export async function fetchPostsFromSupabase(): Promise<{
  ready: boolean;
  sqlTableReady: boolean;
  posts: Post[];
  reels: Post[];
  stories: Story[];
  creatorStats: Record<string, CreatorStats>;
  commentsByPost: Record<string, CommentItem[]>;
  placeVotes: Record<string, number>;
}> {
  try {
    const res = await fetch("/api/supabase/state", {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      return {
        ready: false,
        sqlTableReady: false,
        posts: [],
        reels: [],
        stories: [],
        creatorStats: {},
        commentsByPost: {},
        placeVotes: {},
      };
    }
    const data = (await res.json()) as {
      ready?: boolean;
      sqlTableReady?: boolean;
      posts?: Post[];
      reels?: Post[];
      stories?: Story[];
      creatorStats?: Record<string, CreatorStats>;
      commentsByPost?: Record<string, CommentItem[]>;
      placeVotes?: Record<string, number>;
    };
    return {
      ready: Boolean(data.ready),
      sqlTableReady: Boolean(data.sqlTableReady),
      posts: Array.isArray(data.posts) ? data.posts : [],
      reels: Array.isArray(data.reels) ? data.reels : [],
      stories: Array.isArray(data.stories) ? data.stories : [],
      creatorStats: data.creatorStats ?? {},
      commentsByPost: data.commentsByPost ?? {},
      placeVotes: data.placeVotes ?? {},
    };
  } catch {
    return {
      ready: false,
      sqlTableReady: false,
      posts: [],
      reels: [],
      stories: [],
      creatorStats: {},
      commentsByPost: {},
      placeVotes: {},
    };
  }
}

export async function saveCloudStateToSupabase(posts: Post[], reels: Post[]): Promise<boolean> {
  try {
    const rows = [
      ...posts.map((p) => ({
        id: p.id,
        creator: p.creator,
        place_id: p.placeId,
        caption: p.caption,
        kind: "post" as const,
        image: p.image ?? null,
        video: p.video ?? null,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        comments: p.comments,
        shares: p.shares,
        views: p.views,
      })),
      ...reels.map((p) => ({
        id: p.id,
        creator: p.creator,
        place_id: p.placeId,
        caption: p.caption,
        kind: "reel" as const,
        image: p.image ?? null,
        video: p.video ?? null,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        comments: p.comments,
        shares: p.shares,
        views: p.views,
      })),
    ];

    const res = await fetch("/api/supabase/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts, reels, rows }),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { ok?: boolean };
    return Boolean(data.ok);
  } catch {
    return false;
  }
}

export async function seedInitialPostsToSupabase(posts: Post[], reels: Post[]) {
  return saveCloudStateToSupabase(posts, reels);
}

export async function saveStoryToNeon(story: Story): Promise<boolean> {
  try {
    const res = await fetch("/api/supabase/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", ...story }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function recordStoryViewInNeon(id: string): Promise<void> {
  try {
    await fetch("/api/supabase/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view", id }),
    });
  } catch {
    // ignore
  }
}

export async function toggleFollowInNeon(handle: string, follow: boolean): Promise<boolean> {
  try {
    const res = await fetch("/api/supabase/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, follow }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fuelCreatorInNeon(handle: string, amount = 500): Promise<boolean> {
  try {
    const res = await fetch("/api/supabase/fuel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, amount }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function addCommentInNeon(
  postId: string,
  body: string,
  author = "you.roamer",
): Promise<CommentItem | null> {
  try {
    const res = await fetch("/api/supabase/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body, author }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok?: boolean; comment?: CommentItem };
    return data.comment ?? null;
  } catch {
    return null;
  }
}

export async function savePlaceVoteInNeon(placeId: string, scoreDelta: number): Promise<void> {
  try {
    await fetch("/api/supabase/place-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ placeId, scoreDelta }),
    });
  } catch {
    // ignore
  }
}

export async function uploadMediaToSupabase(file: File): Promise<string> {
  try {
    const res = await fetch("/api/supabase/upload", {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "x-file-name": encodeURIComponent(file.name),
      },
      body: file,
    });
    if (res.ok) {
      const data = (await res.json()) as { ok?: boolean; url?: string };
      if (data.ok && data.url) {
        return data.url;
      }
    }
  } catch {
    // fallback to data URL below
  }

  return await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve(URL.createObjectURL(file));
    reader.readAsDataURL(file);
  });
}
