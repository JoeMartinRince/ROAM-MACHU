import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  Fuel,
  HeartHandshake,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
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

type PaymentMethod = "upi" | "card" | "netbanking" | "wallet";

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

        <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5">
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

        <div className="absolute right-2.5 top-2.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#072654]/85 px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wider text-sky-300 uppercase backdrop-blur-md">
            <ShieldCheck size={10} className="text-sky-400" />
            Razorpay Demo
          </span>
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
                <span>Fuel this trip · Razorpay Demo</span>
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
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-teal">
                <MapPin size={12} />
                <span>{place?.name ?? fund.placeId}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#072654]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-sky-600 dark:bg-sky-500/15 dark:text-sky-300 uppercase">
                <ShieldCheck size={11} />
                Razorpay Test Mode
              </span>
            </div>
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
                Fuel this trip via Razorpay Demo ({formatMoneyShort(fund.raised)} /{" "}
                {formatMoneyShort(fund.goal)})
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** Fuel Payment / Contribute Sheet with Built-in Razorpay Test-Mode Checkout */
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

  // Razorpay Demo Checkout state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState<string>(
    `${store.currentUser.handle.replace(/[^a-z0-9]/gi, "") || "roamer"}@okaxis`,
  );
  const [selectedBank, setSelectedBank] = useState<string>("HDFC Bank");
  const [processing, setProcessing] = useState(false);
  const [successResult, setSuccessResult] = useState<{
    amount: number;
    paymentId: string;
    method: string;
  } | null>(null);

  const amount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;
  const notEnoughBalance = amount > walletBalance;

  const handleOpenRazorpayDemo = () => {
    if (amount < 10) {
      toast.error("Minimum contribution is ₹10");
      return;
    }
    if (notEnoughBalance) {
      toast.error("Not enough balance in your demo wallet");
      return;
    }
    setCheckoutOpen(true);
  };

  const completeContribution = (methodLabel: string) => {
    setProcessing(true);
    setTimeout(() => {
      try {
        const paymentId = `pay_test_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
        addContribution(fund.id, amount, name, note);
        setProcessing(false);
        setCheckoutOpen(false);
        setSuccessResult({ amount, paymentId, method: methodLabel });
        toast.success(`Razorpay Test Payment ₹${amount} successful! 🎉 (${paymentId})`);
        onSuccess?.();
      } catch (err) {
        setProcessing(false);
        toast.error(err instanceof Error ? err.message : "Could not record contribution");
      }
    }, 550);
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

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-t-[24px] border border-border bg-card shadow-card animate-in slide-in-from-bottom-4 duration-200 sm:rounded-[24px]">
        {successResult ? (
          <div className="p-6 text-center space-y-3">
            <div className="mx-auto grid size-16 place-items-center rounded-full bg-teal/15 text-teal animate-bounce">
              <Sparkles size={32} />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
              <CheckCircle2 size={12} /> Razorpay Test Payment Verified
            </span>
            <h2 className="font-display text-2xl font-normal text-foreground">
              You fueled ₹{successResult.amount} 🎉
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your contribution has been added to{" "}
              <span className="font-semibold text-foreground">{fund.title}</span>! Remaining wallet
              balance:{" "}
              <span className="font-semibold text-foreground">
                {formatMoneyFull(walletBalance)}
              </span>
            </p>

            <div className="mx-auto max-w-xs rounded-[14px] border border-border bg-muted/50 p-3 text-left font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID</span>
                <span className="font-semibold text-foreground">{successResult.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="text-foreground uppercase">{successResult.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gateway</span>
                <span className="text-teal font-semibold">Razorpay (Test Mode)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="tap-scale mt-3 inline-flex h-10 items-center justify-center rounded-full bg-teal px-6 font-display text-xs font-normal text-white shadow-xs"
            >
              Done
            </button>
          </div>
        ) : checkoutOpen ? (
          /* Built-in Razorpay Test-Mode Checkout Modal */
          <div className="flex flex-col">
            {/* Razorpay Navy Header */}
            <div className="bg-[#072654] px-5 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="grid size-9 place-items-center rounded-lg bg-teal font-display text-sm text-white shadow-xs">
                    RM
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-white">Roam Machu</h3>
                      <span className="rounded bg-amber-400 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-950 uppercase">
                        TEST MODE
                      </span>
                    </div>
                    <p className="line-clamp-1 text-[11px] text-white/75">Fuel: {fund.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Back to amount selection"
                  onClick={() => setCheckoutOpen(false)}
                  className="grid size-7 place-items-center rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-white/15 pt-3">
                <span className="font-mono text-[11px] text-white/75 uppercase">
                  Amount Payable
                </span>
                <span className="font-display text-2xl font-normal text-white tabular-nums">
                  ₹{amount}.00
                </span>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-5 pb-[calc(var(--safe-bottom)+1.25rem)] sm:pb-5 space-y-4">
              <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-muted p-1">
                {(
                  [
                    { id: "upi", label: "UPI", icon: Smartphone },
                    { id: "card", label: "Card", icon: CreditCard },
                    { id: "netbanking", label: "Bank", icon: Building2 },
                    { id: "wallet", label: "Wallet", icon: Wallet },
                  ] as const
                ).map((tab) => {
                  const Icon = tab.icon;
                  const active = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentMethod(tab.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[11px] font-medium transition",
                        active
                          ? "bg-card text-teal shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Details */}
              {paymentMethod === "upi" && (
                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Instant UPI (Test Mode)
                    </span>
                    <div className="flex gap-1.5 font-mono text-[10px] text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5">GPay</span>
                      <span className="rounded bg-muted px-1.5 py-0.5">PhonePe</span>
                      <span className="rounded bg-muted px-1.5 py-0.5">Paytm</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-teal"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Any test VPA is auto-approved in Razorpay Demo mode.
                  </p>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="space-y-2.5 rounded-xl border border-border bg-muted/30 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Razorpay Test Visa Card
                    </span>
                    <span className="font-mono text-[10px] text-teal">Auto-filled</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value="4111  1111  1111  1111"
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-xs text-foreground"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      readOnly
                      value="12 / 29"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-xs text-foreground"
                    />
                    <input
                      type="text"
                      readOnly
                      value="•••"
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 font-mono text-xs text-foreground"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div className="grid grid-cols-2 gap-2">
                  {["HDFC Bank", "SBI", "ICICI Bank", "Axis Bank"].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={cn(
                        "rounded-xl border p-2.5 text-left text-xs font-medium transition",
                        selectedBank === bank
                          ? "border-teal bg-teal/10 text-teal font-semibold"
                          : "border-border bg-muted/30 text-foreground hover:bg-muted",
                      )}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              )}

              {paymentMethod === "wallet" && (
                <div className="rounded-xl border border-teal/30 bg-teal/10 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      Roam Machu Demo Wallet
                    </span>
                    <span className="font-mono text-xs font-bold text-teal">
                      {formatMoneyFull(walletBalance)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Signed in as @{store.currentUser.handle} · Instant deduction
                  </p>
                </div>
              )}

              {/* Razorpay Test Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => completeContribution(paymentMethod)}
                  className="tap-scale flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#072654] font-display text-sm font-normal text-white shadow-float transition hover:bg-[#0a3573] disabled:opacity-50"
                >
                  {processing ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Verifying Razorpay Test Payment…</span>
                    </span>
                  ) : (
                    <>
                      <Lock size={14} className="text-sky-300" />
                      <span>Pay ₹{amount} (Razorpay Test Success)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => toast.error("Simulated Razorpay test payment declined")}
                  className="w-full rounded-lg py-1.5 text-center font-mono text-[11px] text-muted-foreground hover:text-destructive transition"
                >
                  Simulate Test Failure
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 border-t border-border pt-2.5 font-mono text-[10px] text-muted-foreground">
                <ShieldCheck size={12} className="text-teal" />
                <span>Secured by Razorpay Demo · No API key or real money required</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5 pb-[calc(var(--safe-bottom)+1.5rem)] sm:pb-6">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />

            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.1em] text-teal uppercase">
                    FUEL THE TRIP
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#072654]/10 px-2 py-0.5 font-mono text-[9px] font-semibold text-sky-600 dark:bg-sky-500/15 dark:text-sky-300 uppercase">
                    <ShieldCheck size={10} />
                    Razorpay Demo
                  </span>
                </div>
                <h2 className="mt-0.5 text-lg font-semibold text-foreground line-clamp-1">
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

            {/* Razorpay Demo Checkout + Instant Confirm buttons */}
            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={amount < 10 || notEnoughBalance}
                onClick={handleOpenRazorpayDemo}
                className="tap-scale flex h-11 w-full items-center justify-center gap-2 rounded-full bg-teal font-display text-sm font-normal text-white shadow-float transition hover:brightness-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Fuel size={16} />
                <span>
                  {notEnoughBalance ? "Not enough balance" : `Pay ₹${amount} via Razorpay Demo`}
                </span>
              </button>
              <p className="text-center text-[11px] text-muted-foreground font-mono">
                🔒 Razorpay Test Mode (UPI / Card / Bank / Wallet) ·{" "}
                {formatMoneyFull(walletBalance)} available
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
