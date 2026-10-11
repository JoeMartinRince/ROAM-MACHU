import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Bell,
  Check,
  Fuel,
  LogOut,
  RotateCcw,
  Sparkles,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  formatMoneyFull,
  getDemoAccountsWithStatus,
  logoutToGuest,
  openNotificationsModal,
  openSettingsModal,
  resetDemoData,
  switchDemoAccount,
  useStore,
} from "@/lib/store";
import { Avatar } from "@/components/Avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

function formatRelativeTime(iso: string): string {
  const diffSec = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

/** Notification Bell button with unread count badge */
export function NotificationBellButton({ className }: { className?: string }) {
  const store = useStore();
  const unreadCount = store.notifications.filter((n) => !n.read).length;

  return (
    <button
      type="button"
      aria-label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : "Notifications"}
      onClick={() => openNotificationsModal(true)}
      className={cn(
        "tap-scale relative grid size-9 shrink-0 place-items-center rounded-full border border-border/80 bg-muted/80 text-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      <Bell size={17} />
      {unreadCount > 0 && (
        <span
          data-testid="notification-badge"
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-background"
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}

/** Global Settings & Demo Login Sheet */
export function SettingsSheet() {
  const store = useStore();
  const navigate = useNavigate();
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  if (!store.settingsOpen) return null;

  const accounts = getDemoAccountsWithStatus();
  const onClose = () => {
    setConfirmResetOpen(false);
    openSettingsModal(false);
  };

  const handleSelectAccount = (accountId: string) => {
    const user = switchDemoAccount(accountId);
    if (!user) return;
    toast.success(`Signed in as ${user.name}`);
    onClose();
    navigate({ to: "/profile" });
  };

  const handleLogout = () => {
    const guest = logoutToGuest();
    toast.success(`Signed in as ${guest.name}`);
    onClose();
    navigate({ to: "/profile" });
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setConfirmResetOpen(false);
    toast.success("Demo data reset to seed state");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      className="fixed inset-0 z-[1200] flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-[20px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[20px] sm:pb-5">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Settings & Appearance</h2>
          <button
            type="button"
            aria-label="Close settings"
            onClick={onClose}
            className="tap-scale grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Appearance */}
          <ThemeToggle />

          {/* Demo login section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-teal" />
                <h3 className="text-sm font-semibold text-foreground">Demo login</h3>
              </div>
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold text-teal uppercase">
                Demo only
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Switch accounts to test follows and trip funds. No password needed.
            </p>

            {/* Account rows */}
            <div className="mt-3 space-y-1.5">
              {accounts.map((acct) => {
                const isActive = acct.isActive;
                return (
                  <button
                    key={acct.id}
                    type="button"
                    onClick={() => {
                      if (!isActive) {
                        handleSelectAccount(acct.id);
                      }
                    }}
                    className={cn(
                      "tap-scale flex w-full items-center justify-between gap-2.5 rounded-[14px] border p-2.5 text-left transition-colors",
                      isActive
                        ? "border-teal/50 bg-teal/10 cursor-default"
                        : "border-border bg-background/70 hover:bg-muted/60 cursor-pointer",
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        name={acct.name}
                        src={acct.avatar}
                        className="size-9 shrink-0 text-xs"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-xs font-semibold text-foreground">
                            {acct.name}
                          </span>
                          {isActive && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-teal px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white uppercase">
                              <Check size={10} /> You
                            </span>
                          )}
                        </div>
                        <p className="truncate text-[11px] text-muted-foreground">@{acct.handle}</p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 font-mono text-[11px] font-semibold text-foreground tabular-nums">
                        <Wallet size={11} className="text-teal" />
                        {formatMoneyFull(acct.wallet)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Log out & Reset demo data actions */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={!!store.currentUser.isGuest}
                onClick={handleLogout}
                className="tap-scale flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <LogOut size={13} />
                <span>Log out</span>
              </button>

              <button
                type="button"
                onClick={() => setConfirmResetOpen(true)}
                className="tap-scale flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-destructive/10 px-3.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
              >
                <RotateCcw size={13} />
                <span>Reset demo data</span>
              </button>
            </div>

            {/* Confirm dialog for Reset demo data */}
            {confirmResetOpen && (
              <div
                role="alertdialog"
                aria-label="Confirm reset demo data"
                className="mt-3 rounded-[14px] border border-destructive/40 bg-destructive/5 p-3.5 animate-in fade-in duration-150"
              >
                <p className="text-xs font-semibold text-foreground">Reset all demo data?</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  This clears funds, contributions, follows, notifications, wallet balances, and
                  profile edits back to the initial seed state.
                </p>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmResetOpen(false)}
                    className="tap-scale rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="tap-scale rounded-full bg-destructive px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:brightness-105"
                  >
                    Confirm reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Global Notifications Sheet */
export function NotificationsSheet() {
  const store = useStore();
  const navigate = useNavigate();

  if (!store.notificationsOpen) return null;

  const notifications = store.notifications;
  const onClose = () => openNotificationsModal(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className="fixed inset-0 z-[1200] flex items-end justify-center p-0 sm:items-center sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      />
      <div className="relative z-10 max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-[20px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[20px] sm:pb-5">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-primary" />
            <h2 className="text-base font-semibold text-foreground">Notifications</h2>
            <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
              @{store.currentUser.handle}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close notifications"
            onClick={onClose}
            className="tap-scale grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-border py-10 px-4 text-center">
              <span className="grid size-11 place-items-center rounded-full bg-muted text-muted-foreground">
                <Sparkles size={20} />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-foreground">All caught up!</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                When someone follows @{store.currentUser.handle} or fuels your trip funds, it will
                show up here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onClose();
                  if (n.actorHandle && n.actorHandle !== "guest") {
                    navigate({ to: "/u/$handle", params: { handle: n.actorHandle } });
                  }
                }}
                className="flex cursor-pointer items-start justify-between gap-3 rounded-[14px] border border-border bg-background/70 p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <Avatar name={n.actorName} src={n.actorAvatar} className="size-9 text-xs" />
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 grid size-4.5 place-items-center rounded-full text-white ring-2 ring-card",
                        n.type === "fuel" ? "bg-teal" : "bg-primary",
                      )}
                    >
                      {n.type === "fuel" ? <Fuel size={10} /> : <UserPlus size={10} />}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground leading-snug">{n.message}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>
                {n.amount && (
                  <span className="shrink-0 rounded-full bg-teal/15 px-2 py-0.5 font-display text-xs font-normal text-teal tabular-nums">
                    +₹{n.amount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
