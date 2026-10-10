import { useSyncExternalStore } from "react";
import { places, seedPosts, seedReels, type Post } from "./data";

export type Vote = 1 | -1 | 0;
type State = {
  posts: Post[];
  reels: Post[];
  votes: Record<string, Vote>;
  placeVotes: Record<string, Vote>;
};

let state: State = { posts: seedPosts, reels: seedReels, votes: {}, placeVotes: {} };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (s: Partial<State>) => {
  state = { ...state, ...s };
  emit();
};

export function useStore() {
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
  state = { posts: seedPosts, reels: seedReels, votes: {}, placeVotes: {} };
}
export const getState = () => state;
