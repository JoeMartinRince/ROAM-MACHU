import { useSyncExternalStore } from "react";
import {
  creators as seedCreators,
  demoAccounts,
  formatMoneyFull,
  formatMoneyShort,
  places,
  seedContributions,
  seedPosts,
  seedReels,
  seedTripFunds,
  type Contribution,
  type Creator,
  type DemoAccount,
  type Post,
  type TripFund,
  type User,
} from "./data";

export { demoAccounts, formatMoneyFull, formatMoneyShort, type DemoAccount };

export type Vote = 1 | -1 | 0;

export type CommentItem = {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type NotificationItem = {
  id: string;
  recipientHandle: string;
  type: "fuel" | "follow";
  actorName: string;
  actorHandle: string;
  actorAvatar?: string | null;
  message: string;
  amount?: number;
  fundId?: string;
  fundTitle?: string;
  createdAt: string;
  read: boolean;
};

export type State = {
  activeAccountId: string;
  currentUser: User;
  walletBalance: number;
  wallets: Record<string, number>;
  profileEdits: Record<string, Partial<User>>;
  creators: Creator[];
  posts: Post[];
  reels: Post[];
  funds: TripFund[];
  contributions: Contribution[];
  votes: Record<string, Vote>;
  votesByAccount: Record<string, Record<string, Vote>>;
  placeVotes: Record<string, Vote>;
  placeVotesByAccount: Record<string, Record<string, Vote>>;
  following: Record<string, boolean>;
  followingByAccount: Record<string, Record<string, boolean>>;
  savedPostIds: string[];
  savedByAccount: Record<string, string[]>;
  notifications: NotificationItem[];
  notificationsByAccount: Record<string, NotificationItem[]>;
  commentsByPost: Record<string, CommentItem[]>;
  activeCommentPostId: string | null;
  activeSharePostId: string | null;
  settingsOpen: boolean;
  notificationsOpen: boolean;
};

const ACTIVE_USER_KEY = "roam-active-user";
const PROFILE_EDITS_KEY = "roam-profile-edits";
const WALLETS_STORAGE_KEY = "roam-wallets";
const FUNDS_STORAGE_KEY = "roam-trip-funds";
const CONTRIBUTIONS_STORAGE_KEY = "roam-contributions";
const FOLLOWING_BY_ACCT_KEY = "roam-following-by-account";
const VOTES_BY_ACCT_KEY = "roam-votes-by-account";
const PLACE_VOTES_BY_ACCT_KEY = "roam-place-votes-by-account";
const SAVED_BY_ACCT_KEY = "roam-saved-by-account";
const NOTIFICATIONS_STORAGE_KEY = "roam-notifications";
const COMMENTS_STORAGE_KEY = "roam-comments";

function getSeedWallets(): Record<string, number> {
  const map: Record<string, number> = {};
  for (const acct of demoAccounts) {
    map[acct.id] = acct.initialWallet;
  }
  return map;
}

function getStoredActiveAccountId(): string {
  if (typeof window === "undefined") return "guest";
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (raw && demoAccounts.some((a) => a.id === raw)) {
      return raw;
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(ACTIVE_USER_KEY, "guest");
  } catch {
    /* ignore */
  }
  return "guest";
}

function getStoredProfileEdits(): Record<string, Partial<User>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PROFILE_EDITS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function getStoredWallets(): Record<string, number> {
  const base = getSeedWallets();
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(WALLETS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...base, ...parsed };
      }
    }
  } catch {
    /* ignore */
  }
  return base;
}

function buildUserForAccount(accountId: string, editsMap: Record<string, Partial<User>>): User {
  const base =
    demoAccounts.find((a) => a.id === accountId) ?? demoAccounts.find((a) => a.id === "guest")!;
  const edits = editsMap[base.id] ?? {};
  return {
    id: base.id,
    name: edits.name ?? base.name,
    handle: edits.handle ?? base.handle,
    bio: edits.bio ?? base.bio,
    avatar: edits.avatar !== undefined ? edits.avatar : base.avatar,
    cover: edits.cover ?? base.cover,
    isGuest: base.isGuest,
  };
}

export function getInitialUser(): User {
  const activeId = getStoredActiveAccountId();
  const edits = getStoredProfileEdits();
  return buildUserForAccount(activeId, edits);
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

function getStoredRecord<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch {
    /* ignore */
  }
  return fallback;
}

const seedComments: Record<string, CommentItem[]> = {
  p1: [
    {
      id: "cm-seed-1",
      postId: "p1",
      author: "roamwithrahul",
      body: "Morning mist over the backwaters hits different! Pwoli frame 🛶",
      createdAt: "2026-10-10T06:30:00Z",
    },
    {
      id: "cm-seed-2",
      postId: "p1",
      author: "monsoon.meera",
      body: "Added to my November Kerala route.",
      createdAt: "2026-10-10T08:15:00Z",
    },
  ],
  p2: [
    {
      id: "cm-seed-3",
      postId: "p2",
      author: "chai.nomad",
      body: "That golden hour light on the tea estates is unreal ✨",
      createdAt: "2026-10-10T09:00:00Z",
    },
  ],
  r1: [
    {
      id: "cm-seed-4",
      postId: "r1",
      author: "jerin.on.road",
      body: "Sound on for the monsoon vibes! 🌧️🌴",
      createdAt: "2026-10-10T10:20:00Z",
    },
  ],
};

function getStoredComments(): Record<string, CommentItem[]> {
  if (typeof window === "undefined") return seedComments;
  try {
    const raw = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return { ...seedComments, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return seedComments;
}

function computeCreatorsList(
  editsMap: Record<string, Partial<User>>,
  followingByAccount: Record<string, Record<string, boolean>>,
): Creator[] {
  return seedCreators.map((c) => {
    const clean = c.handle.toLowerCase();
    const edit = editsMap[c.handle] ?? {};
    let extraFollowers = 0;
    for (const acctId of Object.keys(followingByAccount)) {
      if (followingByAccount[acctId]?.[clean]) {
        extraFollowers += 1;
      }
    }
    return {
      ...c,
      name: edit.name ?? c.name,
      handle: edit.handle ?? c.handle,
      bio: edit.bio ?? c.bio,
      avatar: edit.avatar !== undefined ? edit.avatar : c.avatar,
      cover: edit.cover ?? c.cover,
      followers: (c.followers ?? 1000) + extraFollowers,
    };
  });
}

function createInitialState(): State {
  const activeAccountId = getStoredActiveAccountId();
  const profileEdits = getStoredProfileEdits();
  const wallets = getStoredWallets();
  const followingByAccount = getStoredRecord<Record<string, Record<string, boolean>>>(
    FOLLOWING_BY_ACCT_KEY,
    {},
  );
  const votesByAccount = getStoredRecord<Record<string, Record<string, Vote>>>(
    VOTES_BY_ACCT_KEY,
    {},
  );
  const placeVotesByAccount = getStoredRecord<Record<string, Record<string, Vote>>>(
    PLACE_VOTES_BY_ACCT_KEY,
    {},
  );
  const savedByAccount = getStoredRecord<Record<string, string[]>>(SAVED_BY_ACCT_KEY, {});
  const notificationsByAccount = getStoredRecord<Record<string, NotificationItem[]>>(
    NOTIFICATIONS_STORAGE_KEY,
    {},
  );
  const currentUser = buildUserForAccount(activeAccountId, profileEdits);

  return {
    activeAccountId,
    currentUser,
    walletBalance: wallets[activeAccountId] ?? (currentUser.isGuest ? 2000 : 5000),
    wallets,
    profileEdits,
    creators: computeCreatorsList(profileEdits, followingByAccount),
    posts: seedPosts,
    reels: seedReels,
    funds: getStoredFunds(),
    contributions: getStoredContributions(),
    votes: votesByAccount[activeAccountId] ?? {},
    votesByAccount,
    placeVotes: placeVotesByAccount[activeAccountId] ?? {},
    placeVotesByAccount,
    following: followingByAccount[activeAccountId] ?? {},
    followingByAccount,
    savedPostIds: savedByAccount[activeAccountId] ?? [],
    savedByAccount,
    notifications: notificationsByAccount[activeAccountId] ?? [],
    notificationsByAccount,
    commentsByPost: getStoredComments(),
    activeCommentPostId: null,
    activeSharePostId: null,
    settingsOpen: false,
    notificationsOpen: false,
  };
}

let state: State = createInitialState();

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

/** Expose currentUser directly via store getter */
export function getCurrentUser(): User {
  return state.currentUser;
}

export function getWalletBalance(accountId?: string): number {
  const id = accountId ?? state.activeAccountId;
  return state.wallets[id] ?? (id === "guest" ? 2000 : 5000);
}

export function getDemoAccountsWithStatus() {
  return demoAccounts.map((acct) => {
    const user = buildUserForAccount(acct.id, state.profileEdits);
    const wallet = state.wallets[acct.id] ?? acct.initialWallet;
    return {
      ...acct,
      name: user.name,
      handle: user.handle,
      bio: user.bio,
      avatar: user.avatar,
      cover: user.cover,
      wallet,
      isActive: state.activeAccountId === acct.id,
    };
  });
}

export function updateCurrentUser(patch: Partial<User>) {
  const activeId = state.activeAccountId;
  const prevEdits = state.profileEdits[activeId] ?? {};
  const nextEditsForAcct = { ...prevEdits, ...patch };
  const nextProfileEdits = { ...state.profileEdits, [activeId]: nextEditsForAcct };
  const updatedUser = buildUserForAccount(activeId, nextProfileEdits);
  const updatedCreators = computeCreatorsList(nextProfileEdits, state.followingByAccount);

  set({
    profileEdits: nextProfileEdits,
    currentUser: updatedUser,
    creators: updatedCreators,
  });

  try {
    localStorage.setItem(PROFILE_EDITS_KEY, JSON.stringify(nextProfileEdits));
  } catch (err) {
    console.error("Failed to persist profile edits:", err);
  }
}

/** Switch active user to a demo account by id or handle */
export function switchDemoAccount(accountIdOrHandle: string): User | null {
  const clean = accountIdOrHandle.trim().replace(/^@/, "").toLowerCase();
  const match = demoAccounts.find(
    (a) => a.id.toLowerCase() === clean || a.handle.toLowerCase() === clean,
  );
  if (!match) return null;

  const nextId = match.id;
  const nextUser = buildUserForAccount(nextId, state.profileEdits);
  const nextWallet = state.wallets[nextId] ?? match.initialWallet;

  set({
    activeAccountId: nextId,
    currentUser: nextUser,
    walletBalance: nextWallet,
    votes: state.votesByAccount[nextId] ?? {},
    placeVotes: state.placeVotesByAccount[nextId] ?? {},
    following: state.followingByAccount[nextId] ?? {},
    savedPostIds: state.savedByAccount[nextId] ?? [],
    notifications: state.notificationsByAccount[nextId] ?? [],
  });

  try {
    localStorage.setItem(ACTIVE_USER_KEY, nextId);
  } catch (err) {
    console.error("Failed to persist active account:", err);
  }
  return nextUser;
}

export const switchAccount = switchDemoAccount;

export function logoutToGuest(): User {
  return switchDemoAccount("guest")!;
}

/** Reset all demo data back to initial seed state */
export function resetDemoData() {
  const keysToClear = [
    PROFILE_EDITS_KEY,
    WALLETS_STORAGE_KEY,
    FUNDS_STORAGE_KEY,
    CONTRIBUTIONS_STORAGE_KEY,
    FOLLOWING_BY_ACCT_KEY,
    VOTES_BY_ACCT_KEY,
    PLACE_VOTES_BY_ACCT_KEY,
    SAVED_BY_ACCT_KEY,
    NOTIFICATIONS_STORAGE_KEY,
    COMMENTS_STORAGE_KEY,
  ];
  if (typeof window !== "undefined") {
    for (const k of keysToClear) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
  }

  const activeId = state.activeAccountId;
  const freshWallets = getSeedWallets();
  const freshUser = buildUserForAccount(activeId, {});

  set({
    currentUser: freshUser,
    walletBalance: freshWallets[activeId] ?? (freshUser.isGuest ? 2000 : 5000),
    wallets: freshWallets,
    profileEdits: {},
    creators: computeCreatorsList({}, {}),
    posts: seedPosts,
    reels: seedReels,
    funds: seedTripFunds,
    contributions: seedContributions,
    votes: {},
    votesByAccount: {},
    placeVotes: {},
    placeVotesByAccount: {},
    following: {},
    followingByAccount: {},
    savedPostIds: [],
    savedByAccount: {},
    notifications: [],
    notificationsByAccount: {},
    commentsByPost: seedComments,
  });
}

export function openSettingsModal(open: boolean) {
  set({ settingsOpen: open });
}

export function openNotificationsModal(open: boolean) {
  if (open) {
    markAllNotificationsRead();
  }
  set({ notificationsOpen: open });
}

export function markAllNotificationsRead() {
  const activeId = state.activeAccountId;
  const list = state.notificationsByAccount[activeId] ?? [];
  if (list.every((n) => n.read)) return;

  const updatedList = list.map((n) => ({ ...n, read: true }));
  const updatedMap = { ...state.notificationsByAccount, [activeId]: updatedList };
  set({
    notifications: updatedList,
    notificationsByAccount: updatedMap,
  });
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedMap));
  } catch {
    /* ignore */
  }
}

export function getUnreadNotificationCount(): number {
  return state.notifications.filter((n) => !n.read).length;
}

function pushNotification(
  recipientHandleOrId: string,
  notif: Omit<NotificationItem, "id" | "recipientHandle" | "createdAt" | "read">,
) {
  const cleanRecipient = recipientHandleOrId.replace(/^@/, "").toLowerCase();
  const targetAccount = demoAccounts.find(
    (a) => a.id.toLowerCase() === cleanRecipient || a.handle.toLowerCase() === cleanRecipient,
  );
  const recipientKey = targetAccount ? targetAccount.id : cleanRecipient;

  const item: NotificationItem = {
    ...notif,
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipientHandle: recipientKey,
    createdAt: new Date().toISOString(),
    read: false,
  };

  const prevList = state.notificationsByAccount[recipientKey] ?? [];
  const nextList = [item, ...prevList];
  const nextMap = { ...state.notificationsByAccount, [recipientKey]: nextList };

  set({
    notificationsByAccount: nextMap,
    notifications: state.activeAccountId === recipientKey ? nextList : state.notifications,
  });

  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(nextMap));
  } catch {
    /* ignore */
  }
}

/** Get creator / user profile info by handle */
export function getCreatorByHandle(handle: string): (Creator & { isCurrentUser?: boolean }) | null {
  const clean = handle.replace(/^@/, "").toLowerCase();
  const found = state.creators.find((c) => c.handle.toLowerCase() === clean);
  if (state.currentUser.handle.toLowerCase() === clean) {
    return {
      handle: state.currentUser.handle,
      name: state.currentUser.name,
      bio: state.currentUser.bio,
      avatar: state.currentUser.avatar,
      cover: state.currentUser.cover,
      followers: found?.followers ?? 0,
      live: found?.live,
      isCurrentUser: true,
    };
  }
  return found ?? null;
}

export function getFollowerCount(handle: string): number {
  const clean = handle.replace(/^@/, "").toLowerCase();
  const found = state.creators.find((c) => c.handle.toLowerCase() === clean);
  return found?.followers ?? 0;
}

/** Follow / unfollow a creator (persists per active account) */
export function toggleFollow(handle: string) {
  const clean = handle.replace(/^@/, "").toLowerCase();
  if (state.currentUser.handle.toLowerCase() === clean) return; // cannot follow yourself

  const activeId = state.activeAccountId;
  const acctFollowing = state.followingByAccount[activeId] ?? {};
  const currentlyFollowing = !!acctFollowing[clean];
  const nextFollowing = !currentlyFollowing;

  const updatedAcctFollowing = { ...acctFollowing, [clean]: nextFollowing };
  const updatedFollowingByAccount = {
    ...state.followingByAccount,
    [activeId]: updatedAcctFollowing,
  };

  const updatedCreators = computeCreatorsList(state.profileEdits, updatedFollowingByAccount);

  set({
    following: updatedAcctFollowing,
    followingByAccount: updatedFollowingByAccount,
    creators: updatedCreators,
  });

  try {
    localStorage.setItem(FOLLOWING_BY_ACCT_KEY, JSON.stringify(updatedFollowingByAccount));
  } catch {
    /* ignore */
  }

  if (nextFollowing) {
    const actorFirst = state.currentUser.isGuest
      ? "Guest traveller"
      : state.currentUser.name.split(" ")[0];
    pushNotification(clean, {
      type: "follow",
      actorName: state.currentUser.name,
      actorHandle: state.currentUser.handle,
      actorAvatar: state.currentUser.avatar,
      message: `${actorFirst} started following you`,
    });
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

export function getTotalReceivedByOwner(handle: string): number {
  return getFundsByOwner(handle).reduce((sum, f) => sum + f.raised, 0);
}

export function getFundById(fundId: string): TripFund | undefined {
  return state.funds.find((f) => f.id === fundId);
}

export function getContributionsForFund(fundId: string): Contribution[] {
  return state.contributions
    .filter((c) => c.fundId === fundId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export type EnrichedContribution = Contribution & {
  fundTitle: string;
  ownerHandle: string;
  ownerName: string;
  placeId: string;
};

/** Get contributions made by a given user/account ("Funded by me") */
export function getContributionsByUser(accountIdOrHandle?: string): EnrichedContribution[] {
  const target = (accountIdOrHandle ?? state.activeAccountId).replace(/^@/, "").toLowerCase();
  const currentName = state.currentUser.name.toLowerCase();

  return state.contributions
    .filter((c) => {
      if (c.contributorId && c.contributorId.toLowerCase() === target) return true;
      if (c.contributorHandle && c.contributorHandle.toLowerCase() === target) return true;
      if (!c.contributorId && target !== "guest" && c.name.toLowerCase() === currentName) {
        return true;
      }
      return false;
    })
    .map((c) => {
      const fund = state.funds.find((f) => f.id === c.fundId);
      const ownerCreator = fund
        ? state.creators.find((cr) => cr.handle.toLowerCase() === fund.ownerHandle.toLowerCase())
        : undefined;
      return {
        ...c,
        fundTitle: fund?.title ?? "Trip Fund",
        ownerHandle: fund?.ownerHandle ?? "creator",
        ownerName: ownerCreator?.name ?? fund?.ownerHandle ?? "Creator",
        placeId: fund?.placeId ?? "alleppey",
      };
    })
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

  const activeId = state.activeAccountId;
  const currentBalance = getWalletBalance(activeId);
  if (amount > currentBalance) {
    throw new Error("Not enough balance");
  }

  const isGuest = !!state.currentUser.isGuest;
  const resolvedName = isGuest
    ? name?.trim() || "Anonymous traveller"
    : name?.trim() || state.currentUser.name;

  const newContribution: Contribution = {
    id: `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fundId,
    contributorId: activeId,
    contributorHandle: state.currentUser.handle,
    avatar: state.currentUser.avatar,
    name: resolvedName,
    amount,
    note: note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  };

  const nextBalance = currentBalance - amount;
  const updatedWallets = { ...state.wallets, [activeId]: nextBalance };

  const nextRaised = targetFund.raised + amount;
  const isFullyFunded = nextRaised >= targetFund.goal;
  const updatedFund: TripFund = {
    ...targetFund,
    raised: nextRaised,
    status: isFullyFunded ? "funded" : targetFund.status,
  };

  const updatedFunds = state.funds.map((f) => (f.id === fundId ? updatedFund : f));
  const updatedContributions = [newContribution, ...state.contributions];

  set({
    walletBalance: nextBalance,
    wallets: updatedWallets,
    funds: updatedFunds,
    contributions: updatedContributions,
  });

  try {
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));
    localStorage.setItem(FUNDS_STORAGE_KEY, JSON.stringify(updatedFunds));
    localStorage.setItem(CONTRIBUTIONS_STORAGE_KEY, JSON.stringify(updatedContributions));
  } catch {
    /* ignore */
  }

  const actorFirst = isGuest ? resolvedName : state.currentUser.name.split(" ")[0];
  pushNotification(targetFund.ownerHandle, {
    type: "fuel",
    actorName: resolvedName,
    actorHandle: state.currentUser.handle,
    actorAvatar: state.currentUser.avatar,
    amount,
    fundId: targetFund.id,
    fundTitle: targetFund.title,
    message: `${actorFirst} fueled ₹${amount} on ${targetFund.title}`,
  });

  return { contribution: newContribution, fund: updatedFund };
}

/** Saved posts mutators (per active account) */
export function toggleSavePost(postId: string) {
  const activeId = state.activeAccountId;
  const currentSaved = state.savedByAccount[activeId] ?? [];
  const exists = currentSaved.includes(postId);
  const updated = exists ? currentSaved.filter((id) => id !== postId) : [...currentSaved, postId];
  const updatedByAcct = { ...state.savedByAccount, [activeId]: updated };
  set({ savedPostIds: updated, savedByAccount: updatedByAcct });
  try {
    localStorage.setItem(SAVED_BY_ACCT_KEY, JSON.stringify(updatedByAcct));
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
  const activeId = state.activeAccountId;
  const cur = state.votes[id] ?? 0;
  const nextVotes: Record<string, Vote> = { ...state.votes, [id]: cur === dir ? 0 : dir };
  const nextByAcct = { ...state.votesByAccount, [activeId]: nextVotes };
  set({ votes: nextVotes, votesByAccount: nextByAcct });
  try {
    localStorage.setItem(VOTES_BY_ACCT_KEY, JSON.stringify(nextByAcct));
  } catch {
    /* ignore */
  }
}

export function votePlace(id: string, dir: 1 | -1) {
  const activeId = state.activeAccountId;
  const cur = state.placeVotes[id] ?? 0;
  const nextPlaceVotes: Record<string, Vote> = {
    ...state.placeVotes,
    [id]: cur === dir ? 0 : dir,
  };
  const nextByAcct = { ...state.placeVotesByAccount, [activeId]: nextPlaceVotes };
  set({ placeVotes: nextPlaceVotes, placeVotesByAccount: nextByAcct });
  try {
    localStorage.setItem(PLACE_VOTES_BY_ACCT_KEY, JSON.stringify(nextByAcct));
  } catch {
    /* ignore */
  }
}

export function addPost(post: Post, isVideo: boolean) {
  if (isVideo) set({ reels: [post, ...state.reels] });
  else set({ posts: [post, ...state.posts] });
}

export function _reset() {
  state = createInitialState();
}

export const getState = () => state;

export function openCommentsModal(postId: string | null) {
  set({ activeCommentPostId: postId });
}

export async function submitComment(postId: string, body: string, author?: string) {
  const cleanAuthor = (author?.trim() || state.currentUser.handle || "guest").replace(/^@/, "");
  const newComment: CommentItem = {
    id: `cm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    postId,
    author: cleanAuthor,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };

  const prev = state.commentsByPost[postId] ?? [];
  const updatedComments: Record<string, CommentItem[]> = {
    ...state.commentsByPost,
    [postId]: [newComment, ...prev],
  };

  const bumpComments = (list: Post[]) =>
    list.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p));

  set({
    commentsByPost: updatedComments,
    posts: bumpComments(state.posts),
    reels: bumpComments(state.reels),
  });

  try {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedComments));
  } catch {
    /* ignore */
  }
}

export function openShareModal(postId: string | null) {
  set({ activeSharePostId: postId });
}

export function sharePost(postId: string) {
  const bumpShares = (list: Post[]) =>
    list.map((p) => (p.id === postId ? { ...p, shares: p.shares + 1 } : p));
  set({
    posts: bumpShares(state.posts),
    reels: bumpShares(state.reels),
    activeSharePostId: postId,
  });
}
