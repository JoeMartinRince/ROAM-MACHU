import { useSyncExternalStore } from "react";
import { creators, places, seedPosts, seedReels, type Post } from "./data";
import {
  addCommentInNeon,
  fetchPostsFromSupabase,
  fuelCreatorInNeon,
  recordStoryViewInNeon,
  saveCloudStateToSupabase,
  savePlaceVoteInNeon,
  saveStoryToNeon,
  seedInitialPostsToSupabase,
  toggleFollowInNeon,
  type CommentItem,
  type CreatorStats,
  type Story,
} from "./supabase";

export type Vote = 1 | -1 | 0;
export type DbStatus = "connecting" | "connected" | "needs_setup";

export const initialStories: Story[] = [
  {
    id: "s1",
    creator: "chai.nomad",
    creatorName: "Anu Joseph",
    placeId: "alleppey",
    caption: "Sunrise shikara ride through Alleppey canals 🛶✨",
    mediaUrl: places.find((p) => p.id === "alleppey")?.image,
    mediaType: "image",
    views: 1420,
  },
  {
    id: "s2",
    creator: "roamwithrahul",
    creatorName: "Rahul Nair",
    placeId: "munnar",
    caption: "6 AM tea estate walk in Kolukkumalai 🌫️🍵",
    mediaUrl: places.find((p) => p.id === "munnar")?.image,
    mediaType: "image",
    views: 980,
  },
  {
    id: "s3",
    creator: "backpackbinu",
    creatorName: "Binu Thomas",
    placeId: "athirappilly",
    caption: "Monsoon spray from Athirappilly viewpoint 💦",
    mediaUrl: places.find((p) => p.id === "athirappilly")?.image,
    mediaType: "image",
    views: 760,
  },
  {
    id: "s4",
    creator: "meera.maps",
    creatorName: "Meera K",
    placeId: "varkala",
    caption: "North Cliff golden hour + fresh lime soda 🌅",
    mediaUrl: places.find((p) => p.id === "varkala")?.image,
    mediaType: "image",
    views: 1890,
  },
  {
    id: "s5",
    creator: "trekkingtess",
    creatorName: "Tess Mathew",
    placeId: "ladakh",
    caption: "Pangong Lake blue hits different at 14,000 ft 🏔️",
    mediaUrl: places.find((p) => p.id === "ladakh")?.image,
    mediaType: "image",
    views: 2310,
  },
  {
    id: "s6",
    creator: "foodiefaiz",
    creatorName: "Faiz Ali",
    placeId: "kochi",
    caption: "Hot pazhampori + beef roast in Fort Kochi 🔥",
    mediaUrl: places.find((p) => p.id === "kochi")?.image,
    mediaType: "image",
    views: 1650,
  },
];

export const defaultCreatorStats: Record<string, CreatorStats> = {
  "chai.nomad": {
    handle: "chai.nomad",
    name: "Anu Joseph",
    live: true,
    followersCount: 47300,
    isFollowing: false,
    tripsFunded: 12,
    raisedAmount: 18400,
    goalAmount: 30000,
  },
  roamwithrahul: {
    handle: "roamwithrahul",
    name: "Rahul Nair",
    live: true,
    followersCount: 32900,
    isFollowing: false,
    tripsFunded: 9,
    raisedAmount: 14200,
    goalAmount: 25000,
  },
  backpackbinu: {
    handle: "backpackbinu",
    name: "Binu Thomas",
    live: false,
    followersCount: 19400,
    isFollowing: false,
    tripsFunded: 6,
    raisedAmount: 9500,
    goalAmount: 20000,
  },
  "meera.maps": {
    handle: "meera.maps",
    name: "Meera K",
    live: false,
    followersCount: 28100,
    isFollowing: false,
    tripsFunded: 8,
    raisedAmount: 12100,
    goalAmount: 20000,
  },
  trekkingtess: {
    handle: "trekkingtess",
    name: "Tess Mathew",
    live: true,
    followersCount: 54200,
    isFollowing: false,
    tripsFunded: 15,
    raisedAmount: 24000,
    goalAmount: 35000,
  },
  foodiefaiz: {
    handle: "foodiefaiz",
    name: "Faiz Ali",
    live: false,
    followersCount: 41800,
    isFollowing: false,
    tripsFunded: 11,
    raisedAmount: 16500,
    goalAmount: 25000,
  },
};

type State = {
  posts: Post[];
  reels: Post[];
  stories: Story[];
  creatorStats: Record<string, CreatorStats>;
  commentsByPost: Record<string, CommentItem[]>;
  activeCommentPostId: string | null;
  votes: Record<string, Vote>;
  placeVotes: Record<string, Vote>;
  dbStatus: DbStatus;
};

const STORAGE_KEY = "roam_machu_state_v2";

const seedImageById = new Map<string, string>();
for (const p of [...seedPosts, ...seedReels]) {
  if (p.image) seedImageById.set(p.id, p.image);
}

function hydrateImages(list: Post[]): Post[] {
  return list.map((p) => {
    if (p.image) return p;
    const fallback = seedImageById.get(p.id) ?? places.find((pl) => pl.id === p.placeId)?.image;
    return fallback ? { ...p, image: fallback } : p;
  });
}

function hydrateStories(list: Story[]): Story[] {
  return list.map((st) => {
    if (st.mediaUrl) return st;
    const fallback = places.find((pl) => pl.id === st.placeId)?.image ?? seedPosts[0]?.image;
    return { ...st, mediaUrl: fallback };
  });
}

function loadPersistedState(): Partial<State> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      posts:
        Array.isArray(parsed.posts) && parsed.posts.length > 0
          ? hydrateImages(parsed.posts)
          : undefined,
      reels:
        Array.isArray(parsed.reels) && parsed.reels.length > 0
          ? hydrateImages(parsed.reels)
          : undefined,
      stories:
        Array.isArray(parsed.stories) && parsed.stories.length > 0
          ? hydrateStories(parsed.stories)
          : undefined,
      creatorStats: parsed.creatorStats ?? undefined,
      commentsByPost: parsed.commentsByPost ?? undefined,
      votes: parsed.votes ?? {},
      placeVotes: parsed.placeVotes ?? {},
    };
  } catch {
    return {};
  }
}

function savePersistedState(s: State) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        posts: s.posts,
        reels: s.reels,
        stories: s.stories,
        creatorStats: s.creatorStats,
        commentsByPost: s.commentsByPost,
        votes: s.votes,
        placeVotes: s.placeVotes,
      }),
    );
  } catch {
    // Ignore storage quota errors
  }
}

let state: State = {
  posts: seedPosts,
  reels: seedReels,
  stories: initialStories,
  creatorStats: defaultCreatorStats,
  commentsByPost: {},
  activeCommentPostId: null,
  votes: {},
  placeVotes: {},
  dbStatus: "connected",
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (s: Partial<State>, persist = true) => {
  state = { ...state, ...s };
  if (persist) savePersistedState(state);
  emit();
};

let initialized = false;

export async function syncWithSupabase() {
  if (typeof window === "undefined") return;
  const persisted = loadPersistedState();
  if (persisted.posts || persisted.reels || persisted.stories || persisted.creatorStats) {
    set(
      {
        posts: persisted.posts ?? state.posts,
        reels: persisted.reels ?? state.reels,
        stories: persisted.stories ?? state.stories,
        creatorStats: persisted.creatorStats ?? state.creatorStats,
        commentsByPost: persisted.commentsByPost ?? state.commentsByPost,
        votes: persisted.votes ?? state.votes,
        placeVotes: persisted.placeVotes ?? state.placeVotes,
      },
      false,
    );
  }

  const res = await fetchPostsFromSupabase();
  if (!res.ready) {
    return;
  }

  if (res.posts.length === 0 && res.reels.length === 0) {
    await seedInitialPostsToSupabase(state.posts, state.reels);
    set({ dbStatus: "connected" }, false);
  } else {
    const mergedStats = { ...defaultCreatorStats, ...res.creatorStats };
    const mergedPlaceVotes: Record<string, Vote> = { ...state.placeVotes };
    for (const [k, v] of Object.entries(res.placeVotes)) {
      if (v > 0) mergedPlaceVotes[k] = 1;
      else if (v < 0) mergedPlaceVotes[k] = -1;
      else mergedPlaceVotes[k] = 0;
    }

    set(
      {
        posts: res.posts.length > 0 ? hydrateImages(res.posts) : state.posts,
        reels: res.reels.length > 0 ? hydrateImages(res.reels) : state.reels,
        stories: res.stories.length > 0 ? hydrateStories(res.stories) : state.stories,
        creatorStats: mergedStats,
        commentsByPost:
          Object.keys(res.commentsByPost).length > 0 ? res.commentsByPost : state.commentsByPost,
        placeVotes: mergedPlaceVotes,
        dbStatus: "connected",
      },
      true,
    );
  }
}

export function useStore() {
  if (typeof window !== "undefined" && !initialized) {
    initialized = true;
    setTimeout(() => {
      syncWithSupabase();
    }, 0);
  }
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
    () => state,
  );
}

/** Each post vote moves its place score by 0.5; each direct place vote by 1. */
export function placeScore(s: State, placeId: string) {
  const p = places.find((x) => x.id === placeId)!;
  let delta = 0;
  for (const post of [...s.posts, ...s.reels])
    if (post.placeId === placeId) delta += (s.votes[post.id] ?? 0) * 0.5;
  delta += s.placeVotes[placeId] ?? 0;
  return Math.round((p.baseScore + delta) * 10) / 10;
}

export function rankedPlaces(s: State) {
  return places
    .map((p) => ({ ...p, score: placeScore(s, p.id) }))
    .sort((a, b) => b.score - a.score);
}

export function votePost(id: string, dir: 1 | -1) {
  const cur = state.votes[id] ?? 0;
  const nextVote: Vote = cur === dir ? 0 : dir;
  const upDelta = (nextVote === 1 ? 1 : 0) - (cur === 1 ? 1 : 0);
  const downDelta = (nextVote === -1 ? 1 : 0) - (cur === -1 ? 1 : 0);

  const updateList = (list: Post[]) =>
    list.map((p) =>
      p.id === id
        ? {
            ...p,
            upvotes: Math.max(0, p.upvotes + upDelta),
            downvotes: Math.max(0, p.downvotes + downDelta),
          }
        : p,
    );

  const nextPosts = updateList(state.posts);
  const nextReels = updateList(state.reels);

  set({
    votes: { ...state.votes, [id]: nextVote },
    posts: nextPosts,
    reels: nextReels,
  });

  saveCloudStateToSupabase(nextPosts, nextReels);
}

export function votePlace(id: string, dir: 1 | -1) {
  const cur = state.placeVotes[id] ?? 0;
  const next: Vote = cur === dir ? 0 : dir;
  set({ placeVotes: { ...state.placeVotes, [id]: next } });
  savePlaceVoteInNeon(id, next);
}

export function addPost(post: Post, isVideo: boolean) {
  const nextPosts = isVideo ? state.posts : [post, ...state.posts];
  const nextReels = isVideo ? [post, ...state.reels] : state.reels;
  set({ posts: nextPosts, reels: nextReels, dbStatus: "connected" });

  saveCloudStateToSupabase(nextPosts, nextReels);
}

export function addStory(story: Story) {
  const nextStories = [story, ...state.stories];
  set({ stories: nextStories });
  saveStoryToNeon(story);
}

export function viewStory(storyId: string) {
  const nextStories = state.stories.map((st) =>
    st.id === storyId ? { ...st, views: st.views + 1 } : st,
  );
  set({ stories: nextStories });
  recordStoryViewInNeon(storyId);
}

export function toggleFollow(handle = "chai.nomad") {
  const existing = state.creatorStats[handle] ?? {
    handle,
    name: creators.find((c) => c.handle === handle)?.name ?? handle,
    live: true,
    followersCount: 47300,
    isFollowing: false,
    tripsFunded: 12,
    raisedAmount: 18400,
    goalAmount: 30000,
  };
  const nextFollow = !existing.isFollowing;
  const nextCount = Math.max(0, existing.followersCount + (nextFollow ? 1 : -1));
  const updated: CreatorStats = {
    ...existing,
    isFollowing: nextFollow,
    followersCount: nextCount,
  };
  set({
    creatorStats: {
      ...state.creatorStats,
      [handle]: updated,
    },
  });
  toggleFollowInNeon(handle, nextFollow);
  return nextFollow;
}

export function fuelCreator(handle = "chai.nomad", amount = 500) {
  const existing = state.creatorStats[handle] ?? defaultCreatorStats["chai.nomad"]!;
  const updated: CreatorStats = {
    ...existing,
    raisedAmount: existing.raisedAmount + amount,
    tripsFunded: existing.tripsFunded + 1,
  };
  set({
    creatorStats: {
      ...state.creatorStats,
      [handle]: updated,
    },
  });
  fuelCreatorInNeon(handle, amount);
}

export function openCommentsModal(postId: string | null) {
  set({ activeCommentPostId: postId }, false);
}

export async function submitComment(postId: string, body: string, author = "you.roamer") {
  const tempComment: CommentItem = {
    id: `c_${Date.now()}`,
    postId,
    author,
    body,
    createdAt: new Date().toISOString(),
  };

  const prevList = state.commentsByPost[postId] ?? [];
  const updateList = (list: Post[]) =>
    list.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p));

  set({
    commentsByPost: {
      ...state.commentsByPost,
      [postId]: [tempComment, ...prevList],
    },
    posts: updateList(state.posts),
    reels: updateList(state.reels),
  });

  await addCommentInNeon(postId, body, author);
}

export function _reset() {
  state = {
    posts: seedPosts,
    reels: seedReels,
    stories: initialStories,
    creatorStats: defaultCreatorStats,
    commentsByPost: {},
    activeCommentPostId: null,
    votes: {},
    placeVotes: {},
    dbStatus: "connected",
  };
}
export const getState = () => state;
