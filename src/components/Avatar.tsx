import { useProfileAvatar } from "@/hooks/use-profile-avatar";
import { cn } from "@/lib/utils";

const tones = ["bg-primary", "bg-teal", "bg-navy"];

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string | null;
  className?: string;
}) {
  const { avatar: profileAvatar } = useProfileAvatar();
  const isProfileUser = name === "Anu Joseph" || name === "chai.nomad";
  const imageSrc = src ?? (isProfileUser ? profileAvatar : null);

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
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold text-on-media ring-1 ring-border/50",
        !imageSrc && tone,
        className,
      )}
    >
      {imageSrc ? (
        <img src={imageSrc} alt={name} className="size-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
