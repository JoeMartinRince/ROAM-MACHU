import { cn } from "@/lib/utils";

const tones = ["bg-primary", "bg-teal", "bg-navy"];

export function Avatar({ name, className }: { name: string; className?: string }) {
  const tone = tones[name.length % tones.length];
  const initials = name
    .replace(/[^a-zA-Z ]/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold text-on-media ring-1 ring-border/50",
        tone,
        className,
      )}
    >
      {initials}
    </div>
  );
}
