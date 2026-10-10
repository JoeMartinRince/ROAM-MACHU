import { useEffect, useState, useCallback } from "react";
import { Sparkles, Calendar, Compass, Lightbulb, RotateCw, CheckCircle2 } from "lucide-react";
import { fetchPlaceAiOverview, type PlaceAiOverviewData } from "@/lib/gemini";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PlaceAiOverviewProps {
  placeName: string;
  region: string;
  className?: string;
}

export function PlaceAiOverview({ placeName, region, className }: PlaceAiOverviewProps) {
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [data, setData] = useState<PlaceAiOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = useCallback(
    async (selectedLang: "en" | "ml", force = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPlaceAiOverview(placeName, region, selectedLang, force);
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load AI overview");
      } finally {
        setLoading(false);
      }
    },
    [placeName, region],
  );

  useEffect(() => {
    loadOverview(lang, false);
  }, [lang, loadOverview]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-primary/25 bg-gradient-to-br from-primary/[0.06] via-card to-teal/[0.06] p-4 shadow-card",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <Sparkles size={16} className={cn(loading && "animate-spin")} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold tracking-tight text-foreground">
              AI Overview
            </h2>
            <p className="truncate text-[11px] text-muted-foreground">
              Smart travel guide for {placeName}
            </p>
          </div>
        </div>

        {/* Language Toggle + Refresh */}
        <div className="flex shrink-0 items-center gap-1.5">
          <div className="flex rounded-full border border-border bg-muted/80 p-0.5 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={cn(
                "rounded-full px-2 py-0.5 transition-all",
                lang === "en"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("ml")}
              className={cn(
                "rounded-full px-2 py-0.5 transition-all",
                lang === "ml"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              മലയാളം
            </button>
          </div>

          <button
            type="button"
            onClick={() => loadOverview(lang, true)}
            disabled={loading}
            aria-label="Regenerate AI Overview"
            title="Regenerate AI Overview"
            className="tap-scale grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <RotateCw size={13} className={cn(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="mt-3.5 space-y-2.5">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-28 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-full rounded-full" />
          <Skeleton className="h-3.5 w-[92%] rounded-full" />
          <Skeleton className="h-3.5 w-[75%] rounded-full" />
          <div className="grid grid-cols-3 gap-2 pt-1">
            <Skeleton className="h-7 rounded-xl" />
            <Skeleton className="h-7 rounded-xl" />
            <Skeleton className="h-7 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
          <span>Could not generate AI overview right now.</span>
          <button
            type="button"
            onClick={() => loadOverview(lang, true)}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="mt-3.5 space-y-3">
          {/* Vibe & Best Time Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <Compass size={12} className="text-primary" />
              {data.vibe}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[11px] font-semibold text-foreground">
              <Calendar size={12} className="text-teal" />
              Best time: {data.bestTime}
            </span>
          </div>

          {/* Summary */}
          <p className="text-xs leading-relaxed text-foreground/90 sm:text-sm">{data.summary}</p>

          {/* Top Highlights */}
          {data.highlights.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Must-Try Highlights
              </p>
              <div className="flex flex-wrap gap-1.5">
                {data.highlights.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card px-2.5 py-1 text-xs font-medium text-foreground shadow-2xs"
                  >
                    <CheckCircle2 size={12} className="shrink-0 text-teal" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Local Tip */}
          {data.localTip && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 p-2.5 text-xs text-foreground">
              <Lightbulb size={15} className="mt-0.5 shrink-0 text-amber-500" />
              <div>
                <span className="font-semibold">Roamer Tip: </span>
                <span className="text-foreground/90">{data.localTip}</span>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
