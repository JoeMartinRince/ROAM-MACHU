import { useState } from "react";
import { Fuel, HeartHandshake, MapPin, Sparkles, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import {
  addContribution,
  formatMoneyFull,
  formatMoneyShort,
  getContributionsForFund,
  useStore,
} from "@/lib/store";
import { places, type TripFund } from "@/lib/data";
import { Avatar } from "@/components/Avatar";
import { cn } from "@/lib/utils";

const AMOUNT_PRESETS = [50, 100, 500, 1000];

export function TripFundCard({
  fund,
  onOpenDetail,
  onFuelClick,
  canFuel = true,
}: {
  fund: TripFund;
  onOpenDetail: (fund: TripFund) => void;
  onFuelClick?: (fund: TripFund) => void;
  canFuel?: boolean;
}) {
  useStore();
  // Get live contributions count
  const contributions = getContributionsForFund(fund.id);
  const place = places.find((p) => p.id === fund.placeId);
  const coverImg = fund.cover || place?.image || "";

  const pct = Math.min(100, Math.round((fund.raised / fund.goal) * 100));
  const isFunded = fund.status === "funded" || fund.raised >= fund.goal;
  const isClosed = fund.status === "closed";

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(fund.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return (
    <article
      onClick={() => onOpenDetail(fund)}
      className="tap-scale group relative flex cursor-pointer flex-col overflow-hidden rounded-[16px] border border-border bg-card p-4 shadow-card transition-all hover:border-teal/40"
    >
      {/* Cover thumbnail & destination tag */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[12px] bg-muted">
        {coverImg && (
          <img
            src={coverImg}
            alt={fund.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-0.5 font-sans text-[11px] font-medium text-white backdrop-blur-md">
            <MapPin size={11} className="text-teal" />
            <span>{place?.name ?? fund.placeId}</span>
          </span>
          {isFunded && (
            <span className="rounded-full bg-teal px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.05em] text-white uppercase">
              Fully Funded 🎉
            </span>
          )}
          {isClosed && (
            <span className="rounded-full bg-muted-foreground/80 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-[0.05em] text-white uppercase">
              Closed
            </span>
          )}
        </div>

        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-end justify-between text-white">
          <span className="font-mono text-[11px] font-medium tracking-[0.05em] text-white/90">
            {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
          </span>
          <span className="font-mono text-[11px] font-medium tracking-[0.05em] text-white/90">
            {contributions.length} supporters
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground group-hover:text-teal">
            {fund.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {fund.story}
          </p>
        </div>

        {/* Progress & metrics */}
        <div className="mt-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-normal text-foreground">
              {formatMoneyShort(fund.raised)}{" "}
              <span className="text-muted-foreground font-sans">
                raised of {formatMoneyShort(fund.goal)}
              </span>
            </span>
            <span className="font-display font-normal text-teal tabular-nums">{pct}%</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          {canFuel && !isClosed && (
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFuelClick) {
                    onFuelClick(fund);
                  } else {
                    onOpenDetail(fund);
                  }
                }}
                className="tap-scale flex h-9 w-full items-center justify-center gap-1.5 rounded-full bg-teal px-4 font-display text-xs font-normal text-white shadow-xs transition hover:brightness-105"
              >
                <Fuel size={14} />
                <span>Fuel this trip</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/** Fund Detail Bottom Sheet / Modal */
export function FundDetailSheet({
  fund: initialFund,
  onClose,
  onFuelClick,
  canFuel = true,
}: {
  fund: TripFund;
  onClose: () => void;
  onFuelClick?: (fund: TripFund) => void;
  canFuel?: boolean;
}) {
  const store = useStore();
  const fund = store.funds.find((f) => f.id === initialFund.id) ?? initialFund;
  const contributions = getContributionsForFund(fund.id);
  const place = places.find((p) => p.id === fund.placeId);
  const coverImg = fund.cover || place?.image || "";
  const pct = Math.min(100, Math.round((fund.raised / fund.goal) * 100));
  const isFunded = fund.status === "funded" || fund.raised >= fund.goal;
  const isClosed = fund.status === "closed";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Trip fund details"
      className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center p-0 sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      />

      <div className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[24px] sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-teal">
              <MapPin size={12} />
              <span>{place?.name ?? fund.placeId}</span>
            </span>
            <h2 className="mt-2 text-xl font-semibold text-foreground leading-snug">
              {fund.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="tap-scale grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cover image */}
        {coverImg && (
          <div className="relative mt-3.5 aspect-[16/9] w-full overflow-hidden rounded-[16px] bg-muted">
            <img src={coverImg} alt={fund.title} className="size-full object-cover" />
            {isFunded && (
              <span className="absolute left-3 top-3 rounded-full bg-teal px-3 py-1 font-mono text-[11px] font-semibold tracking-[0.05em] text-white uppercase shadow-sm">
                Fully Funded 🎉
              </span>
            )}
          </div>
        )}

        {/* Progress Card */}
        <div className="mt-4 rounded-[16px] border border-border bg-muted/40 p-4 space-y-2.5">
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-display text-lg font-normal text-foreground">
                {formatMoneyFull(fund.raised)}
              </p>
              <p className="text-xs text-muted-foreground">goal of {formatMoneyFull(fund.goal)}</p>
            </div>
            <div className="text-right">
              <span className="font-display text-lg font-normal text-teal tabular-nums">
                {pct}%
              </span>
              <p className="text-xs text-muted-foreground font-mono uppercase">funded</p>
            </div>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-teal transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground font-mono pt-1">
            <span>{contributions.length} supporters</span>
            <span>
              Created{" "}
              {new Date(fund.createdAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Story */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            About this roam
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {fund.story}
          </p>
        </div>

        {/* Supporter Wall */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <HeartHandshake size={16} className="text-teal" />
              <span>Supporters Wall ({contributions.length})</span>
            </h3>
            {contributions.length > 0 && (
              <span className="font-mono text-xs text-muted-foreground">Latest contributions</span>
            )}
          </div>

          <div className="mt-3 space-y-2.5">
            {contributions.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-border p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Be the first roamer to fuel this trip! ⛽
                </p>
              </div>
            ) : (
              contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-start justify-between gap-3 rounded-[12px] border border-border/80 bg-muted/40 p-3"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-2.5">
                    <Avatar name={c.name} src={c.avatar} className="size-8 shrink-0 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-foreground">{c.name}</p>
                      {c.note && (
                        <p className="mt-0.5 text-xs italic text-muted-foreground">“{c.note}”</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-display text-xs font-normal text-teal tabular-nums">
                      {formatMoneyShort(c.amount)}
                    </span>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {new Date(c.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Button */}
        {canFuel && !isClosed && (
          <div className="mt-6 sticky bottom-0 pt-2 bg-gradient-to-t from-card via-card to-transparent">
            <button
              type="button"
              onClick={() => {
                onClose();
                onFuelClick?.(fund);
              }}
              className="tap-scale flex h-11 w-full items-center justify-center gap-2 rounded-full bg-teal font-display text-sm font-normal text-white shadow-float transition hover:brightness-105"
            >
              <Fuel size={17} />
              <span>
                Fuel this trip ({formatMoneyShort(fund.raised)} / {formatMoneyShort(fund.goal)})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Fuel Payment / Contribute Sheet */
export function FuelTripSheet({
  fund,
  onClose,
  onSuccess,
}: {
  fund: TripFund;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const store = useStore();
  const walletBalance = store.walletBalance;
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [name, setName] = useState<string>(
    store.currentUser.isGuest ? "Anonymous traveller" : store.currentUser.name,
  );
  const [note, setNote] = useState<string>("");
  const [successResult, setSuccessResult] = useState<{ amount: number } | null>(null);

  const amount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const notEnoughBalance = amount > walletBalance;

  const handleConfirmFuel = () => {
    if (amount < 10) {
      toast.error("Minimum contribution is ₹10");
      return;
    }
    if (notEnoughBalance) {
      toast.error("Not enough balance");
      return;
    }

    try {
      addContribution(fund.id, amount, name, note);
      setSuccessResult({ amount });
      toast.success(`Fueled ₹${amount} on ${fund.title}! 🎉`);
      onSuccess?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not record contribution");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Fuel trip"
      className="fixed inset-0 z-[1300] flex items-end justify-center sm:items-center p-0 sm:p-4"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      />

      <div className="relative z-10 w-full max-w-md rounded-t-[24px] border border-border bg-card p-5 pb-[calc(var(--safe-bottom)+1.5rem)] shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[24px] sm:pb-6">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />

        {successResult ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal/15 text-teal animate-bounce">
              <Sparkles size={32} />
            </div>
            <h2 className="font-display text-2xl font-normal text-foreground">
              You fueled ₹{successResult.amount} 🎉
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your contribution has been added to {fund.title}! Remaining wallet balance:{" "}
              <span className="font-semibold text-foreground">
                {formatMoneyFull(walletBalance)}
              </span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="tap-scale mt-4 inline-flex h-10 items-center justify-center rounded-full bg-teal px-6 font-display text-xs font-normal text-white shadow-xs"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="font-mono text-[10px] font-semibold tracking-[0.1em] text-teal uppercase">
                  FUEL THE TRIP
                </span>
                <h2 className="text-lg font-semibold text-foreground line-clamp-1">{fund.title}</h2>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="tap-scale grid size-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            {/* Wallet balance bar */}
            <div className="mt-3 flex items-center justify-between rounded-[14px] border border-teal/30 bg-accent/60 px-3.5 py-2.5">
              <div className="flex items-center gap-2">
                <Wallet size={15} className="text-teal" />
                <span className="text-xs font-semibold text-foreground">
                  Your balance: {formatMoneyFull(walletBalance)}
                </span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground">
                @{store.currentUser.handle}
              </span>
            </div>

            {/* Amount presets */}
            <div className="mt-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Select Amount
              </label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {AMOUNT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(p);
                      setCustomAmount("");
                    }}
                    className={cn(
                      "tap-scale flex h-11 items-center justify-center rounded-xl border text-sm font-display font-normal transition-all",
                      selectedAmount === p && !customAmount
                        ? "border-teal bg-teal text-white shadow-xs"
                        : "border-border bg-muted/60 text-foreground hover:bg-muted",
                    )}
                  >
                    ₹{p}
                  </button>
                ))}
              </div>

              {/* Custom amount */}
              <div className="mt-2.5">
                <input
                  type="number"
                  min="10"
                  placeholder="Or enter custom amount (min ₹10)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                  }}
                  className="w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30 font-display font-normal"
                />
              </div>

              {notEnoughBalance && (
                <p className="mt-1.5 text-xs font-semibold text-destructive">Not enough balance</p>
              )}
            </div>

            {/* Supporter details */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  Your Name
                </label>
                <div className="mt-1 flex items-center gap-2.5">
                  <Avatar
                    name={name || store.currentUser.name}
                    src={store.currentUser.avatar}
                    className="size-9 shrink-0 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Anonymous traveller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                    Note for Creator (Optional)
                  </label>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {note.length}/80
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="Leave words of encouragement…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-teal focus:ring-2 focus:ring-teal/30"
                />
              </div>
            </div>

            {/* Confirm button */}
            <div className="mt-5">
              <button
                type="button"
                disabled={amount < 10 || notEnoughBalance}
                onClick={handleConfirmFuel}
                className="tap-scale flex h-11 w-full items-center justify-center gap-2 rounded-full bg-teal font-display text-sm font-normal text-white shadow-float transition hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Fuel size={16} />
                <span>{notEnoughBalance ? "Not enough balance" : `Confirm & Fuel ₹${amount}`}</span>
              </button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground font-mono">
                Deducted from your demo wallet ({formatMoneyFull(walletBalance)} available)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
