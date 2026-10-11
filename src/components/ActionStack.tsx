import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { formatCount, type Post } from "@/lib/data";
import { openCommentsModal, sharePost, useStore, votePost, type Vote } from "@/lib/store";
import { cn } from "@/lib/utils";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Paper plane SVG oriented pointing right (0deg) so CSS rotate() controls exact pitch angle */
export function PaperPlaneIcon({
  size = 18,
  filled = false,
  className,
}: {
  size?: number;
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 5.5L21.5 12L3 18.5L6.8 12L3 5.5Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path
        d="M21.5 12H6.8"
        stroke={filled ? "rgba(255,255,255,0.65)" : "currentColor"}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Dustbin SVG with separate animated lid group (.rm-bin-lid) and body group (.rm-bin-body) */
export function DustbinIcon({
  size = 18,
  filled = false,
  lidFlap = false,
  shake = false,
  className,
}: {
  size?: number;
  filled?: boolean;
  lidFlap?: boolean;
  shake?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(shake && "rm-bin-shake", className)}
      aria-hidden="true"
    >
      {/* Separate lid group hinged at left (5px, 6px) */}
      <g className={cn("rm-bin-lid", lidFlap && "rm-bin-lid-flap")}>
        <path
          d="M4 6H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 6V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V6"
          fill={filled ? "#52525b" : "none"}
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      {/* Bin body */}
      <g className="rm-bin-body">
        <path
          d="M6 6.5H18L17 19.2C16.94 20.21 16.1 21 15.09 21H8.91C7.9 21 7.06 20.21 7 19.2L6 6.5Z"
          fill={filled ? "#52525b" : "none"}
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        <path
          d="M10 10.5V16.5M14 10.5V16.5"
          stroke={filled ? "#e4e4e7" : "currentColor"}
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/** Departure-board digit flip with fixed minimum width so layout never shifts */
export function DepartureDigit({
  value,
  direction,
  flipKey,
  className,
}: {
  value: string;
  direction: "up" | "down";
  flipKey: number;
  className?: string;
}) {
  const [prevVal, setPrevVal] = useState(value);
  const [currVal, setCurrVal] = useState(value);
  const [animKey, setAnimKey] = useState(0);
  const lastFlipKeyRef = useRef(flipKey);

  useEffect(() => {
    if (flipKey !== lastFlipKeyRef.current || value !== currVal) {
      lastFlipKeyRef.current = flipKey;
      setPrevVal(currVal);
      setCurrVal(value);
      if (!prefersReducedMotion()) {
        setAnimKey((k) => k + 1);
      }
    }
  }, [flipKey, value, currVal]);

  useEffect(() => {
    if (animKey === 0) return;
    const t = setTimeout(() => {
      setPrevVal(currVal);
    }, 260);
    return () => clearTimeout(t);
  }, [animKey, currVal]);

  const isFlipping = animKey > 0;
  const widerText = prevVal.length >= currVal.length ? prevVal : currVal;

  return (
    <span
      className={cn(
        "relative inline-grid min-w-[2.8ch] overflow-hidden align-bottom text-center tabular-nums",
        className,
      )}
    >
      {/* Invisible sizer keeps width stable */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 select-none px-0.5">
        {widerText}
      </span>
      {isFlipping && (
        <span
          key={`out-${animKey}`}
          aria-hidden="true"
          className={cn(
            "pointer-events-none col-start-1 row-start-1",
            direction === "up" ? "rm-flip-out-up" : "rm-flip-out-down",
          )}
        >
          {prevVal}
        </span>
      )}
      <span
        key={`in-${animKey}`}
        className={cn(
          "col-start-1 row-start-1",
          isFlipping && (direction === "up" ? "rm-flip-in-up" : "rm-flip-in-down"),
        )}
      >
        {currVal}
      </span>
    </span>
  );
}

const PWOLI_TRAIL_POINTS = [
  { x: 6, y: -10, delay: 30, size: 3.5 },
  { x: 12, y: -21, delay: 85, size: 3.5 },
  { x: 18, y: -34, delay: 145, size: 3 },
  { x: 24, y: -48, delay: 215, size: 3 },
  { x: 29, y: -61, delay: 290, size: 2.5 },
  { x: 33, y: -72, delay: 365, size: 2.5 },
];

/** Pointer-events: none flying plane + faint dotted trail for Pwoli takeoff */
function PwoliFlightOverlay({ iconSize }: { iconSize: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible"
    >
      {/* Curved dotted trail fading from the plane backward */}
      {PWOLI_TRAIL_POINTS.map((pt, i) => (
        <span
          key={i}
          style={{
            left: `calc(50% + ${pt.x}px)`,
            top: `calc(50% + ${pt.y}px)`,
            width: `${pt.size}px`,
            height: `${pt.size}px`,
            animationDelay: `${pt.delay}ms`,
          }}
          className="rm-pwoli-trail-dot absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF4D16] shadow-[0_0_3px_rgba(0,0,0,0.45)]"
        />
      ))}

      {/* Flying orange paper plane */}
      <span className="rm-pwoli-flyer relative inline-flex items-center justify-center text-[#FF4D16] drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
        {/* Attached tail dots that travel right behind the plane */}
        <span className="absolute -left-2 top-1/2 size-1 -translate-y-1/2 rounded-full bg-[#FF4D16]/75" />
        <span className="absolute -left-3.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-[#FF4D16]/45" />
        <span className="absolute -left-5 top-1/2 size-0.5 -translate-y-1/2 rounded-full bg-[#FF4D16]/25" />
        <PaperPlaneIcon size={iconSize} filled={true} />
      </span>
    </span>
  );
}

const WASTE_TRAIL_POINTS = [
  { x: -18, y: -15, delay: 140, size: 3 },
  { x: -13, y: -12, delay: 205, size: 3 },
  { x: -8, y: -8, delay: 275, size: 2.5 },
  { x: -4, y: -4, delay: 345, size: 2.5 },
];

/** Pointer-events: none thrown gray plane + dotted trail + dust puffs for Waste downvote */
function WasteThrowOverlay({ iconSize }: { iconSize: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible"
    >
      {/* Dotted trail along the throw arc above-left of the bin */}
      {WASTE_TRAIL_POINTS.map((pt, i) => (
        <span
          key={i}
          style={{
            left: `calc(50% + ${pt.x}px)`,
            top: `calc(50% + ${pt.y}px)`,
            width: `${pt.size}px`,
            height: `${pt.size}px`,
            animationDelay: `${pt.delay}ms`,
          }}
          className="rm-waste-trail-dot absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.65)] dark:bg-zinc-300"
        />
      ))}

      {/* Clip region whose bottom edge sits at the bin's front opening rim so the plane is hidden as it drops in */}
      <span
        style={{
          bottom: "52%",
          height: "54px",
          width: "72px",
        }}
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-hidden"
      >
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <span className="rm-waste-throw-plane inline-flex items-center justify-center text-zinc-200 drop-shadow-[0_1px_3px_rgba(0,0,0,0.75)] dark:text-zinc-200">
            <PaperPlaneIcon size={Math.max(14, iconSize - 2)} filled={true} />
          </span>
        </span>
      </span>

      {/* 3 small gray dust dots that puff up from the lid at 650–900ms */}
      <span className="rm-dust-1 absolute size-1.5 rounded-full bg-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.5)] dark:bg-zinc-400" />
      <span className="rm-dust-2 absolute size-1.5 rounded-full bg-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.5)] dark:bg-zinc-300" />
      <span className="rm-dust-3 absolute size-1.5 rounded-full bg-zinc-300 shadow-[0_1px_2px_rgba(0,0,0,0.5)] dark:bg-zinc-400" />
    </span>
  );
}

/** Shared controller hook for Pwoli & Waste animations, switching delays, and 3-flight cap */
function useVoteAnimationController(v: Vote, onVote: (dir: 1 | -1) => void) {
  const [pwoliFlights, setPwoliFlights] = useState<{ id: number }[]>([]);
  const [wasteThrows, setWasteThrows] = useState<{ id: number }[]>([]);
  const [pwoliAnim, setPwoliAnim] = useState<"idle" | "press" | "unvote" | "switch-fade">("idle");
  const [wasteAnim, setWasteAnim] = useState<"idle" | "throw" | "unvote">("idle");
  const [wasteSettling, setWasteSettling] = useState(false);
  const [flipDir, setFlipDir] = useState<"up" | "down">("up");
  const [flipTick, setFlipTick] = useState(0);

  const nextIdRef = useRef(1);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
    return id;
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    };
  }, []);

  const triggerPwoliFlight = useCallback(() => {
    setPwoliAnim("press");
    schedule(() => {
      setPwoliAnim((cur) => (cur === "press" ? "idle" : cur));
    }, 700);

    if (!prefersReducedMotion()) {
      const fid = nextIdRef.current++;
      // Cap concurrent flights at 3
      setPwoliFlights((prev) => [...prev.slice(-2), { id: fid }]);
      schedule(() => {
        setPwoliFlights((prev) => prev.filter((item) => item.id !== fid));
      }, 720);
    }
  }, [schedule]);

  const triggerWasteThrow = useCallback(() => {
    setWasteAnim("throw");
    if (!prefersReducedMotion()) {
      setWasteSettling(true);
      schedule(() => {
        setWasteSettling(false);
      }, 580);
    }
    schedule(() => {
      setWasteAnim((cur) => (cur === "throw" ? "idle" : cur));
    }, 900);

    if (!prefersReducedMotion()) {
      const tid = nextIdRef.current++;
      // Cap concurrent effects at 3
      setWasteThrows((prev) => [...prev.slice(-2), { id: tid }]);
      schedule(() => {
        setWasteThrows((prev) => prev.filter((item) => item.id !== tid));
      }, 920);
    }
  }, [schedule]);

  const handlePwoliClick = useCallback(() => {
    if (v === 1) {
      // Un-vote: quiet 150ms fade to outline, no flight
      setPwoliFlights([]);
      setPwoliAnim("unvote");
      setFlipDir("down");
      setFlipTick((t) => t + 1);
      onVote(1);
      schedule(() => setPwoliAnim("idle"), 160);
      return;
    }

    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
      try {
        navigator.vibrate(12);
      } catch {
        /* ignore */
      }
    }

    setFlipDir("up");
    setFlipTick((t) => t + 1);
    onVote(1);

    if (v === -1) {
      // Switching from Waste to Pwoli: bin goes back to outline (150ms) and then takeoff plays
      setWasteThrows([]);
      setWasteSettling(false);
      setWasteAnim("unvote");
      schedule(() => {
        setWasteAnim("idle");
        triggerPwoliFlight();
      }, 150);
    } else {
      triggerPwoliFlight();
    }
  }, [v, onVote, schedule, triggerPwoliFlight]);

  const handleWasteClick = useCallback(() => {
    if (v === -1) {
      // Un-vote: bin returns to outline with a quick 150ms fade, no throw
      setWasteThrows([]);
      setWasteSettling(false);
      setWasteAnim("unvote");
      setFlipDir("up");
      setFlipTick((t) => t + 1);
      onVote(-1);
      schedule(() => setWasteAnim("idle"), 160);
      return;
    }

    setFlipDir("down");
    setFlipTick((t) => t + 1);
    onVote(-1);

    if (v === 1) {
      // Switching from Pwoli to Waste: plane returns to outline quickly (120ms), then throw plays
      setPwoliFlights([]);
      setPwoliAnim("switch-fade");
      schedule(() => {
        setPwoliAnim("idle");
        triggerWasteThrow();
      }, 120);
    } else {
      triggerWasteThrow();
    }
  }, [v, onVote, schedule, triggerWasteThrow]);

  return {
    pwoliFlights,
    wasteThrows,
    pwoliAnim,
    wasteAnim,
    wasteFilled: v === -1 && !wasteSettling,
    flipDir,
    flipTick,
    handlePwoliClick,
    handleWasteClick,
  };
}

export function ActionStack({ post, size = "md" }: { post: Post; size?: "md" | "lg" }) {
  const s = useStore();
  const v = s.votes[post.id] ?? 0;
  const isLg = size === "lg";
  const voteIconSize = isLg ? 19 : 17;
  const subIconSize = isLg ? 18 : 16;
  const circleClass = isLg ? "size-10 lg:size-11" : "size-9";
  const idleSurface = isLg
    ? "bg-black/35 backdrop-blur-md hover:bg-black/50 lg:border lg:border-border lg:bg-card lg:text-foreground lg:shadow-card lg:hover:bg-muted"
    : "bg-black/35 backdrop-blur-md hover:bg-black/50";
  const labelColor = isLg
    ? "text-white/95 drop-shadow-xs lg:text-foreground lg:drop-shadow-none"
    : "text-white/95 drop-shadow-xs";
  const upCount = formatCount(post.upvotes + (v === 1 ? 1 : 0));

  const {
    pwoliFlights,
    wasteThrows,
    pwoliAnim,
    wasteAnim,
    wasteFilled,
    flipDir,
    flipTick,
    handlePwoliClick,
    handleWasteClick,
  } = useVoteAnimationController(v, (dir) => votePost(post.id, dir));

  return (
    <div
      className={cn(
        "flex w-14 shrink-0 flex-col items-center",
        isLg ? "gap-2.5 lg:gap-3.5" : "gap-2",
      )}
    >
      {/* Pwoli (Upvote) Button */}
      <button
        type="button"
        aria-label={`Pwoli upvote (${upCount})`}
        aria-pressed={v === 1}
        onClick={handlePwoliClick}
        className=" group relative flex w-full flex-col items-center gap-1 overflow-visible text-on-media"
      >
        <span
          className={cn(
            "relative grid place-items-center overflow-visible rounded-full transition-colors duration-150",
            circleClass,
            v === 1
              ? "bg-[#FF4D16]/20 text-[#FF4D16] ring-1 ring-[#FF4D16]/70 shadow-float backdrop-blur-md lg:bg-[#FF4D16]/15"
              : idleSurface,
          )}
        >
          {pwoliFlights.map((f) => (
            <PwoliFlightOverlay key={f.id} iconSize={voteIconSize} />
          ))}
          <span
            className={cn(
              "inline-flex items-center justify-center -rotate-25 transition-opacity duration-150 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
              pwoliAnim === "press" && "rm-pwoli-press",
              pwoliAnim === "unvote" && "rm-unvote-fade",
              pwoliAnim === "switch-fade" && "rm-switch-fade-120",
            )}
          >
            <PaperPlaneIcon size={voteIconSize} filled={v === 1} />
          </span>
        </span>
        <span
          className={cn(
            "flex items-center justify-center gap-0.5 text-center text-[11px] leading-none font-normal font-display whitespace-nowrap",
            labelColor,
          )}
        >
          <span>Pwoli</span>
          <DepartureDigit value={upCount} direction={flipDir} flipKey={flipTick} />
        </span>
      </button>

      {/* Waste (Downvote) Button */}
      <button
        type="button"
        aria-label="Waste downvote"
        aria-pressed={v === -1}
        onClick={handleWasteClick}
        className="group relative flex w-full flex-col items-center gap-1 overflow-visible text-on-media"
      >
        <span
          className={cn(
            "relative grid place-items-center overflow-visible rounded-full transition-colors duration-150",
            circleClass,
            wasteFilled
              ? "bg-zinc-800/85 text-zinc-200 ring-1 ring-zinc-400/60 shadow-card backdrop-blur-md dark:bg-zinc-700/90 dark:text-zinc-100"
              : idleSurface,
          )}
        >
          {wasteThrows.map((t) => (
            <WasteThrowOverlay key={t.id} iconSize={voteIconSize} />
          ))}
          <span
            className={cn(
              "inline-flex items-center justify-center transition-opacity duration-150 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]",
              wasteAnim === "unvote" && "rm-unvote-fade",
            )}
          >
            <DustbinIcon
              size={voteIconSize}
              filled={wasteFilled}
              lidFlap={wasteAnim === "throw"}
              shake={wasteAnim === "throw"}
            />
          </span>
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-normal font-display",
            labelColor,
          )}
        >
          Waste
        </span>
      </button>

      {/* Comments Button */}
      <button
        type="button"
        aria-label={`Comments (${formatCount(post.comments)})`}
        onClick={() => openCommentsModal(post.id)}
        className="tap-scale group flex w-full flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-150",
            circleClass,
            idleSurface,
          )}
        >
          <MessageCircle size={subIconSize} />
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-normal font-display tabular-nums",
            labelColor,
          )}
        >
          {formatCount(post.comments)}
        </span>
      </button>

      {/* Share Button */}
      <button
        type="button"
        aria-label={`Share (${formatCount(post.shares)})`}
        onClick={() => {
          navigator.clipboard?.writeText(window.location.origin + "/place/" + post.placeId);
          sharePost(post.id);
          toast.success("Link copied");
        }}
        className="tap-scale group flex w-full flex-col items-center gap-1 text-on-media"
      >
        <span
          className={cn(
            "grid place-items-center rounded-full transition-all duration-150",
            circleClass,
            idleSurface,
          )}
        >
          <Share2 size={subIconSize} />
        </span>
        <span
          className={cn(
            "text-center text-[11px] leading-none font-normal font-display tabular-nums",
            labelColor,
          )}
        >
          {formatCount(post.shares)}
        </span>
      </button>
    </div>
  );
}

/** Place page score + Pwoli & Waste buttons with identical paper-plane & dustbin animations */
export function PlaceVoteRow({
  score,
  vote,
  onVote,
}: {
  score: number;
  vote: Vote;
  onVote: (dir: 1 | -1) => void;
}) {
  const {
    pwoliFlights,
    wasteThrows,
    pwoliAnim,
    wasteAnim,
    wasteFilled,
    flipDir,
    flipTick,
    handlePwoliClick,
    handleWasteClick,
  } = useVoteAnimationController(vote, onVote);

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="shrink-0 rounded-[16px] bg-accent px-3.5 py-2 text-center">
        <p className="font-display text-xl font-normal text-teal tabular-nums">
          <DepartureDigit value={String(score)} direction={flipDir} flipKey={flipTick} />
        </p>
        <p className="font-mono text-[10px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
          SCORE
        </p>
      </div>

      <button
        type="button"
        aria-pressed={vote === 1}
        onClick={handlePwoliClick}
        className={cn(
          "relative flex h-11 flex-1 items-center justify-center gap-2 overflow-visible rounded-full font-display text-sm font-normal transition-colors duration-150",
          vote === 1
            ? "border border-[#FF4D16]/50 bg-[#FF4D16]/12 text-[#FF4D16] shadow-float"
            : "border border-border bg-muted text-foreground hover:bg-muted/80",
        )}
      >
        <span className="relative inline-flex items-center justify-center overflow-visible">
          {pwoliFlights.map((f) => (
            <PwoliFlightOverlay key={f.id} iconSize={18} />
          ))}
          <span
            className={cn(
              "inline-flex items-center justify-center -rotate-25",
              pwoliAnim === "press" && "rm-pwoli-press",
              pwoliAnim === "unvote" && "rm-unvote-fade",
              pwoliAnim === "switch-fade" && "rm-switch-fade-120",
            )}
          >
            <PaperPlaneIcon size={18} filled={vote === 1} />
          </span>
        </span>
        <span>Pwoli</span>
      </button>

      <button
        type="button"
        aria-pressed={vote === -1}
        onClick={handleWasteClick}
        className={cn(
          "relative flex h-11 flex-1 items-center justify-center gap-2 overflow-visible rounded-full font-display text-sm font-normal transition-colors duration-150",
          wasteFilled
            ? "border border-zinc-500/50 bg-zinc-700 text-zinc-100 shadow-card dark:bg-zinc-800"
            : "border border-border bg-muted text-foreground hover:bg-muted/80",
        )}
      >
        <span className="relative inline-flex items-center justify-center overflow-visible">
          {wasteThrows.map((t) => (
            <WasteThrowOverlay key={t.id} iconSize={18} />
          ))}
          <span
            className={cn(
              "inline-flex items-center justify-center",
              wasteAnim === "unvote" && "rm-unvote-fade",
            )}
          >
            <DustbinIcon
              size={18}
              filled={wasteFilled}
              lidFlap={wasteAnim === "throw"}
              shake={wasteAnim === "throw"}
            />
          </span>
        </span>
        <span>Waste</span>
      </button>
    </div>
  );
}
