import { useSyncExternalStore } from "react";
import {
  creators as seedCreators,
  formatMoneyFull,
  formatMoneyShort,
  photos,
  places,
  seedContributions,
  seedPosts,
  seedReels,
  seedTripFunds,
  type Contribution,
  type Creator,
  type Post,
  type TripFund,
  type User,
} from "./data";

export { formatMoneyFull, formatMoneyShort };

export type Vote = 1 | -1 | 0;

export type State = {
  currentUser: User;
  creators: Creator[];
  posts: Post[];
  reels: Post[];
  funds: TripFund[];
  contributions: Contribution[];
  votes: Record<string, Vote>;
  placeVotes: Record<string, Vote>;
  following: Record<string, boolean>; // handle -> boolean
  savedPostIds: string[];
};

const USER_STORAGE_KEY = "roam-current-user";
const FUNDS_STORAGE_KEY = "roam-trip-funds";
const CONTRIBUTIONS_STORAGE_KEY = "roam-contributions";
const FOLLOWING_STORAGE_KEY = "roam-following";
const SAVED_STORAGE_KEY = "roam-saved-posts";

export function getInitialUser(): User {
  if (typeof window === "undefined") {
    return {
      id: "device_default",
      name: "Roamer",
      handle: "roamer_1001",
      bio: "Wandering across Kerala and beyond 🌴",
      avatar: null,
      cover: photos.hills,
    };
  }
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.handle) return parsed;
    }
  } catch {
    /* fallback below */
  }

  // Create local user on first load
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const deviceId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `dev_${Date.now()}_${randomSuffix}`;
  const newUser: User = {
    id: deviceId,
    name: "Roamer",
    handle: `roamer_${randomSuffix}`,
    bio: "Wandering across Kerala and beyond 🌴",
    avatar: null,
    cover: photos.hills,
  };
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
  } catch {
    /* ignore */
  }
  return newUser;
}

function getStoredFunds(): TripFund[] {
  if (typeof window === "undefined") return seedTripFunds;
  try {
    const raw = localStorage.getItem(FUNDS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fallback to seed */
  }
  return seedTripFunds;
}

function getStoredContributions(): Contribution[] {
  if (typeof window === "undefined") return seedContributions;
  try {
    const raw = localStorage.getItem(CONTRIBUTIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* fallback to seed */
  }
  return seedContributions;
}

function getStoredFollowing(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(FOLLOWING_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return {};
}

function getStoredSaved(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return [];
}

let state: State = {
  currentUser: getInitialUser(),
  creators: seedCreators,
  posts: seedPosts,
  reels: seedReels,
  funds: getStoredFunds(),
  contributions: getStoredContributions(),
  votes: {},
  placeVotes: {},
  following: getStoredFollowing(),
  savedPostIds: getStoredSaved(),
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const set = (s: Partial<State>) => {
  state = { ...state, ...s };
  emit();
};

export function useStore(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
    () => state,
  );
}

/** Expose currentUser directly via store getter / hook */
export function getCurrentUser(): User {
  return state.currentUser;
}

export function updateCurrentUser(patch: Partial<User>) {
  const updated: User = { ...state.currentUser, ...patch };
  set({ currentUser: updated });
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to persist currentUser:", err);
  }
}

/** Get creator / user profile info by handle */
export function getCreatorByHandle(handle: string): (Creator & { isCurrentUser?: boolean }) | null {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (state.currentUser.handle.toLowerCase() === clean) {
    return {
      handle: state.currentUser.handle,
      name: state.currentUser.name,
      bio: state.currentUser.bio,
      avatar: state.currentUser.avatar,
      cover: state.currentUser.cover,
      followers: 0,
      isCurrentUser: true,
    };
  }
  const found = state.creators.find((c) => c.handle.toLowerCase() === clean);
  return found ?? null;
}

/** Follow / unfollow a creator */
export function toggleFollow(handle: string) {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (state.currentUser.handle.toLowerCase() === clean) return; // cannot follow yourself
  const currentlyFollowing = !!state.following[clean];
  const nextFollowing = !currentlyFollowing;
  const updatedFollowing = { ...state.following, [clean]: nextFollowing };

  // Also update creator's follower count in state
  const updatedCreators = state.creators.map((c) => {
    if (c.handle.toLowerCase() === clean) {
      const curFollowers = c.followers ?? 1000;
      return { ...c, followers: Math.max(0, curFollowers + (nextFollowing ? 1 : -1)) };
    }
    return c;
  });

  set({ following: updatedFollowing, creators: updatedCreators });
  try {
    localStorage.setItem(FOLLOWING_STORAGE_KEY, JSON.stringify(updatedFollowing));
  } catch {
    /* ignore */
  }
}

export function isFollowing(handle: string): boolean {
  const clean = handle.replace(/^@/, "").toLowerCase();
  return !!state.following[clean];
}

/** Trip funds accessors & mutators */
export function getFundsByOwner(handle: string): TripFund[] {
  const clean = handle.replace(/^@/, "").toLowerCase();
  return state.funds.filter((f) => f.ownerHandle.toLowerCase() === clean);
}

export function getActiveFundsByOwner(handle: string): TripFund[] {
  return getFundsByOwner(handle).filter((f) => f.status === "active");
}

export function getFundById(fundId: string): TripFund | undefined {
  return state.funds.find((f) => f.id === fundId);
}

export function getContributionsForFund(fundId: string): Contribution[] {
  return state.contributions
    .filter((c) => c.fundId === fundId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createTripFund(
  fundData: Omit<TripFund, "id" | "ownerHandle" | "raised" | "status" | "createdAt">,
): TripFund {
  const newFund: TripFund = {
    ...fundData,
    id: `fund-${Date.now()}`,
    ownerHandle: state.currentUser.handle,
    raised: 0,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  const updated = [newFund, ...state.funds];
  set({ funds: updated });
  try {
    localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  return newFund;
}

export function updateTripFund(
  fundId: string,
  patch: Partial<Omit<TripFund, "id" | "ownerHandle" | "raised">>,
): TripFund | undefined {
  const updated = state.funds.map((f) => (f.id === fundId ? { ...f, ...patch } : f));
  set({ funds: updated });
  try {
    localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
  return updated.find((f) => f.id === fundId);
}

export function closeTripFund(fundId: string) {
  updateTripFund(fundId, { status: "closed" });
}

export function addContribution(
  fundId: string,
  amount: number,
  name?: string,
  note?: string,
): { contribution: Contribution; fund: TripFund } {
  const targetFund = state.funds.find((f) => f.id === fundId);
  if (!targetFund) throw new Error("Fund not found");
  if (targetFund.ownerHandle.toLowerCase() === state.currentUser.handle.toLowerCase()) {
    throw new Error("You cannot fund your own trip");
  }

  const newContribution: Contribution = {
    id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fundId,
    name: name?.trim() || "Anonymous traveller",
    amount,
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const nextRaised = targetFund.raised + amount;
  const isFullyFunded = nextRaised >= targetFund.goal;
  const updatedFund: TripFund = {
    ...targetFund,
    raised: nextRaised,
    status: isFullyFunded ? "funded" : targetFund.status,
  };

  const updatedFunds = state.funds.map((f) => (f.id === fundId ? updatedFund : f));
  const updatedContributions = [newContribution, ...state.contributions];

  set({ funds: updatedFunds, contributions: updatedContributions });

  try {
    localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(updatedFunds));
    localStorage.setItem(CONTRIBUTIONS_STORAGE_KEY, JSON.stringify(updatedContributions));
  } catch {
    /* ignore */
  }

  return { contribution: newContribution, fund: updatedFund };
}

/** Saved posts mutators */
export function toggleSavePost(postId: string) {
  const exists = state.savedPostIds.includes(postId);
  const updated = exists
    ? state.savedPostIds.filter((id) => id !== postId)
    : [...state.savedPostIds, postId];
  set({ savedPostIds: updated });
  try {
    localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

export function isPostSaved(postId: string): boolean {
  return state.savedPostIds.includes(postId);
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
  set({ votes: { ...state.votes, [id]: cur === dir ? 0 : dir } });
}

export function votePlace(id: string, dir: 1 | -1) {
  const cur = state.placeVotes[id] ?? 0;
  set({ placeVotes: { ...state.placeVotes, [id]: cur === dir ? 0 : dir } });
}

export function addPost(post: Post, isVideo: boolean) {
  if (isVideo) set({ reels: [post, ...state.reels] });
  else set({ posts: [post, ...state.posts] });
}

export function _reset() {
  state = {
    currentUser: getInitialUser(),
    creators: seedCreators,
    posts: seedPosts,
    reels: seedReels,
    funds: seedTripFunds,
    contributions: seedContributions,
    votes: {},
    placeVotes: {},
    following: {},
    savedPostIds: [],
  };
}

export const getState = () => state;

/** Opens the comments modal for a post (stub — wire up a real modal when ready). */
export function openCommentsModal(_postId: string) {
  // TODO: set modal state once a CommentsModal component exists
}
