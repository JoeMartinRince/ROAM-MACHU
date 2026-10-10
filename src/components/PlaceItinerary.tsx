import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  Clock,
  Compass,
  Copy,
  Check,
  Hotel,
  MapPin,
  RotateCw,
  Sparkles,
  Sun,
  Sunrise,
  Moon,
  Utensils,
  Wallet,
  Backpack,
  Car,
  Plus,
  Trash2,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { fetchPlaceItinerary, type PlaceItineraryData } from "@/lib/gemini";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PlaceItineraryProps {
  placeName: string;
  region: string;
  lat: number;
  lng: number;
}

interface CustomNote {
  id: string;
  day: number;
  text: string;
}

export function PlaceItinerary({ placeName, region }: PlaceItineraryProps) {
  const [daysCount, setDaysCount] = useState<number>(2);
  const [style, setStyle] = useState<"budget" | "comfort" | "luxury">("comfort");
  const [lang, setLang] = useState<"en" | "ml">("en");
  const [activeDay, setActiveDay] = useState<number>(1);
  const [data, setData] = useState<PlaceItineraryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [checkedSlots, setCheckedSlots] = useState<Record<string, boolean>>({});
  const [checkedPack, setCheckedPack] = useState<Record<string, boolean>>({});
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [copied, setCopied] = useState(false);

  const loadItinerary = useCallback(
    async (d: number, s: "budget" | "comfort" | "luxury", l: "en" | "ml", force = false) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchPlaceItinerary(placeName, region, d, s, l, force);
        setData(res);
        setActiveDay(1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not generate itinerary");
      } finally {
        setLoading(false);
      }
    },
    [placeName, region],
  );

  useEffect(() => {
    loadItinerary(daysCount, style, lang, false);
  }, [daysCount, style, lang, loadItinerary]);

  const toggleSlotCheck = (key: string) => {
    setCheckedSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePackCheck = (item: string) => {
    setCheckedPack((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setCustomNotes((prev) => [
      ...prev,
      { id: Date.now().toString(), day: activeDay, text: newNoteText.trim() },
    ]);
    setNewNoteText("");
    toast.success(`Added to Day ${activeDay} plan!`);
  };

  const handleRemoveNote = (id: string) => {
    setCustomNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleCopyItinerary = () => {
    if (!data) return;
    const lines = [
      `🗺️ ${placeName}, ${region} — ${daysCount}-Day Trip Plan (${style.toUpperCase()})`,
      `💰 Estimated Budget: ${data.totalBudget}`,
      `🏨 Stay: ${data.stayRecommendation}`,
      `🚗 How to Reach: ${data.howToReach}`,
      "",
      ...data.days.flatMap((d) => [
        `📅 DAY ${d.day}: ${d.theme}`,
        ...d.slots.map(
          (s) =>
            `  • [${s.period} | ${s.time}] ${s.title} @ ${s.spot} (${s.estimatedCost})\n    ${s.description}\n    🍽️ Food: ${s.foodTip}`,
        ),
        "",
      ]),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    toast.success("Full itinerary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getPeriodIcon = (period: string) => {
    if (period.toLowerCase().includes("morn"))
      return <Sunrise size={15} className="text-amber-500" />;
    if (period.toLowerCase().includes("after"))
      return <Sun size={15} className="text-orange-500" />;
    return <Moon size={15} className="text-indigo-400" />;
  };

  const currentDayObj = data?.days.find((d) => d.day === activeDay) ?? data?.days[0];

  return (
    <div className="mt-4 space-y-4 pb-8">
      {/* Planner Control Bar */}
      <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <Compass size={18} className={cn(loading && "animate-spin")} />
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-foreground">
                Smart Trip Planner & Itinerary
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Customize days, budget & checklist for {placeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex rounded-full border border-border bg-muted/80 p-0.5 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={cn(
                  "rounded-full px-2.5 py-0.5 transition-all",
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
                  "rounded-full px-2.5 py-0.5 transition-all",
                  lang === "ml"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                മലയാളം
              </button>
            </div>

            {data && (
              <button
                type="button"
                onClick={handleCopyItinerary}
                title="Copy full itinerary"
                className="tap-scale flex h-7 items-center gap-1 rounded-full border border-border bg-muted/70 px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => loadItinerary(daysCount, style, lang, true)}
              disabled={loading}
              title="Regenerate Plan"
              className="tap-scale grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <RotateCw size={13} className={cn(loading && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Duration & Budget Style Pills */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          {/* Days selector */}
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[11px] font-semibold text-muted-foreground">Duration:</span>
            {[1, 2, 3, 4].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDaysCount(d)}
                className={cn(
                  "tap-scale rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                  daysCount === d
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "border border-border bg-muted/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {d} {d === 1 ? "Day" : "Days"}
              </button>
            ))}
          </div>

          {/* Style selector */}
          <div className="flex items-center gap-1">
            <span className="mr-1 text-[11px] font-semibold text-muted-foreground">Style:</span>
            {(
              [
                { id: "budget", label: "🎒 Budget" },
                { id: "comfort", label: "✨ Comfort" },
                { id: "luxury", label: "💎 Luxury" },
              ] as const
            ).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={cn(
                  "tap-scale rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                  style === s.id
                    ? "bg-teal text-white shadow-2xs"
                    : "border border-border bg-muted/60 text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-[20px]" />
            <Skeleton className="h-32 rounded-[20px]" />
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-36 rounded-[20px]" />
            <Skeleton className="h-36 rounded-[20px]" />
            <Skeleton className="h-36 rounded-[20px]" />
          </div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-[20px] border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-sm font-semibold text-destructive">
            Could not generate trip itinerary right now.
          </p>
          <button
            type="button"
            onClick={() => loadItinerary(daysCount, style, lang, true)}
            className="tap-scale mt-3 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
          >
            Try Again
          </button>
        </div>
      ) : data ? (
        <>
          {/* Top Overview Cards: Budget Breakdown + Travel Logistics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Budget Card */}
            <div className="rounded-[20px] border border-emerald-500/25 bg-gradient-to-br from-emerald-500/[0.07] via-card to-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Wallet size={15} /> Estimated Budget ({daysCount}D)
                </span>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400">
                  Per Person
                </span>
              </div>
              <p className="mt-1.5 text-lg font-extrabold tracking-tight text-foreground">
                {data.totalBudget}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/80 px-2.5 py-1">
                  <span className="text-muted-foreground">🏨 Stay</span>
                  <span className="font-semibold text-foreground">{data.budgetBreakdown.stay}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/80 px-2.5 py-1">
                  <span className="text-muted-foreground">🍛 Food</span>
                  <span className="font-semibold text-foreground">{data.budgetBreakdown.food}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/80 px-2.5 py-1">
                  <span className="text-muted-foreground">🚕 Travel</span>
                  <span className="font-semibold text-foreground">
                    {data.budgetBreakdown.transport}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/70 bg-card/80 px-2.5 py-1">
                  <span className="text-muted-foreground">🎟️ Entry</span>
                  <span className="font-semibold text-foreground">
                    {data.budgetBreakdown.activities}
                  </span>
                </div>
              </div>
            </div>

            {/* Stay & Transport Logistics Card */}
            <div className="flex flex-col justify-between rounded-[20px] border border-border bg-card p-4 shadow-card">
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2">
                  <Hotel size={15} className="mt-0.5 shrink-0 text-primary" />
                  <div>
                    <span className="font-bold text-foreground">Where to Stay: </span>
                    <span className="text-muted-foreground">{data.stayRecommendation}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Car size={15} className="mt-0.5 shrink-0 text-teal" />
                  <div>
                    <span className="font-bold text-foreground">How to Reach: </span>
                    <span className="text-muted-foreground">{data.howToReach}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-amber-500" />
                  <div>
                    <span className="font-bold text-foreground">Local Commute: </span>
                    <span className="text-muted-foreground">{data.localTransport}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Selector Tabs */}
          {data.days.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.days.map((d) => {
                const isSelected = activeDay === d.day;
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => setActiveDay(d.day)}
                    className={cn(
                      "tap-scale flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-bold transition-all",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground shadow-float"
                        : "border-border bg-card text-foreground hover:bg-muted",
                    )}
                  >
                    <Calendar size={14} />
                    <span>Day {d.day}</span>
                    <span
                      className={cn(
                        "max-w-[130px] truncate font-normal",
                        isSelected ? "text-primary-foreground/90" : "text-muted-foreground",
                      )}
                    >
                      • {d.theme}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Day Timeline */}
          {currentDayObj && (
            <div className="rounded-[20px] border border-border bg-card p-4 shadow-card sm:p-5">
              <div className="flex items-center justify-between border-b border-border/70 pb-3">
                <div>
                  <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
                    Day {currentDayObj.day} Schedule
                  </span>
                  <h3 className="text-base font-bold text-foreground">{currentDayObj.theme}</h3>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  Tap items to check off
                </span>
              </div>

              <div className="relative mt-4 space-y-4 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-[2px] before:bg-border">
                {currentDayObj.slots.map((slot, idx) => {
                  const slotKey = `${currentDayObj.day}-${idx}`;
                  const isDone = !!checkedSlots[slotKey];
                  return (
                    <div key={slotKey} className="relative pl-9">
                      {/* Timeline Node */}
                      <span
                        className={cn(
                          "absolute top-1 left-0 grid size-8 place-items-center rounded-full border-2 bg-card transition-colors",
                          isDone
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                            : "border-primary/40 text-foreground",
                        )}
                      >
                        {getPeriodIcon(slot.period)}
                      </span>

                      {/* Slot Card */}
                      <div
                        onClick={() => toggleSlotCheck(slotKey)}
                        className={cn(
                          "cursor-pointer rounded-2xl border p-3.5 transition-all",
                          isDone
                            ? "border-emerald-500/40 bg-emerald-500/[0.04] opacity-80"
                            : "border-border bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
                        )}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                              {slot.period}
                            </span>
                            <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                              <Clock size={11} /> {slot.time}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-bold text-teal">
                              {slot.estimatedCost}
                            </span>
                            {isDone ? (
                              <CheckSquare size={16} className="text-emerald-500" />
                            ) : (
                              <Square size={16} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>

                        <h4
                          className={cn(
                            "mt-2 text-sm font-bold text-foreground",
                            isDone && "line-through",
                          )}
                        >
                          {slot.title}
                        </h4>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {slot.description}
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-xl border border-border/80 bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">
                            <MapPin size={12} className="text-primary" />
                            {slot.spot}
                          </span>
                          {slot.foodTip && (
                            <span className="inline-flex items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                              <Utensils size={12} className="text-amber-500" />
                              {slot.foodTip}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User's Custom Notes / Stops for this Day */}
              <div className="mt-5 border-t border-border/70 pt-4">
                <p className="text-xs font-bold text-foreground">
                  📝 Your Personal Stops for Day {currentDayObj.day}
                </p>
                {customNotes.filter((n) => n.day === currentDayObj.day).length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {customNotes
                      .filter((n) => n.day === currentDayObj.day)
                      .map((n) => (
                        <li
                          key={n.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground"
                        >
                          <span className="flex items-center gap-2">
                            <Sparkles size={13} className="text-primary" />
                            {n.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNote(n.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
                <form onSubmit={handleAddNote} className="mt-2.5 flex gap-2">
                  <input
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder={`Add custom spot or note to Day ${currentDayObj.day}...`}
                    className="h-9 flex-1 rounded-full border border-input bg-muted px-3.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="tap-scale flex h-9 items-center gap-1 rounded-full bg-primary px-3.5 text-xs font-semibold text-primary-foreground"
                  >
                    <Plus size={14} /> Add
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Packing & Essentials Checklist */}
          {data.packingList && data.packingList.length > 0 && (
            <div className="rounded-[20px] border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <Backpack size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Packing & Trip Essentials Checklist
                </h3>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.packingList.map((item, i) => {
                  const checked = !!checkedPack[item];
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => togglePackCheck(item)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-medium transition-all",
                        checked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 line-through dark:text-emerald-300"
                          : "border-border bg-muted/40 text-foreground hover:bg-muted",
                      )}
                    >
                      {checked ? (
                        <CheckSquare size={15} className="shrink-0 text-emerald-500" />
                      ) : (
                        <Square size={15} className="shrink-0 text-muted-foreground" />
                      )}
                      <span>{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
