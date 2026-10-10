import { useEffect, useState } from "react";
import logoLight from "@/assets/logo-splash.png";
import logoDark from "@/assets/logo-dark.png";
import pinImg from "@/assets/pin-icon.png";

// sessionStorage key — one play per browser session
const SPLASH_KEY = "roam-splash-seen";

// All keyframes are scoped to .rm-splash so they don't affect anything else.
// The `html[data-splash-seen] .rm-splash { display:none }` rule hides the
// splash before hydration if the inline script already set the attribute.
const KEYFRAMES = `
@keyframes rm-pin-drop {
  0%   { transform: translateY(-200px) scaleY(0.85); opacity: 0; }
  55%  { opacity: 1; }
  65%  { transform: translateY(0)       scaleY(1.06); }
  78%  { transform: translateY(-14px)   scaleY(0.96); }
  90%  { transform: translateY(5px)     scaleY(1.03); }
  100% { transform: translateY(0)       scaleY(1);    opacity: 1; }
}
@keyframes rm-ripple {
  0%   { transform: scale(0.2); opacity: 0.65; }
  100% { transform: scale(4.5); opacity: 0;    }
}
@keyframes rm-logo-in {
  0%   { opacity: 0; transform: scale(0.86) translateY(6px); }
  100% { opacity: 1; transform: scale(1)    translateY(0);   }
}
@keyframes rm-logo-fade {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes rm-fade-out {
  0%   { opacity: 1; pointer-events: none; }
  100% { opacity: 0; pointer-events: none; }
}
html[data-splash-seen] .rm-splash { display: none !important; }
`;

type Phase = "pin" | "ripple" | "logo" | "out" | "done";

export function Splash() {
  // Lazily read sessionStorage on first render — StrictMode-safe because
  // useState initializer only runs once per mount lifecycle.
  const [skip] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !!sessionStorage.getItem(SPLASH_KEY);
  });

  // Lazily read prefers-reduced-motion — stays constant for the session.
  const [reduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // Read dark mode from the class already set by the inline THEME_INIT_SCRIPT.
  const [isDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const [phase, setPhase] = useState<Phase>("pin");

  useEffect(() => {
    if (skip) return;

    let timers: ReturnType<typeof setTimeout>[] = [];

    const after = (ms: number, fn: () => void) => {
      const t = setTimeout(fn, ms);
      timers.push(t);
    };

    if (reduced) {
      // prefers-reduced-motion: just a simple fade-in then fade-out
      after(1100, () => setPhase("out"));
      after(1450, () => {
        sessionStorage.setItem(SPLASH_KEY, "1");
        document.documentElement.setAttribute("data-splash-seen", "1");
        setPhase("done");
      });
    } else {
      // Full pin-drop sequence
      // 0–700 ms   → pin drops
      after(700, () => setPhase("ripple"));
      // 700–1100 ms → ripples expand
      after(1100, () => setPhase("logo"));
      // 1100–1500 ms → logo fades in
      after(1500, () => setPhase("out"));
      // 1500–1850 ms → whole overlay fades out, then unmount
      after(1850, () => {
        sessionStorage.setItem(SPLASH_KEY, "1");
        document.documentElement.setAttribute("data-splash-seen", "1");
        setPhase("done");
      });
    }

    return () => timers.forEach(clearTimeout);
  }, [skip, reduced]);

  // Already seen this session — render nothing immediately
  if (skip || phase === "done") return null;

  const logo = isDark ? logoDark : logoLight;

  return (
    <>
      <style>{KEYFRAMES}</style>

      {/* Overlay */}
      <div
        className="rm-splash fixed inset-0 z-[2000] flex items-center justify-center"
        style={{
          background: isDark ? "#000000" : "#FDFAF5",
          animation:
            phase === "out" ? "rm-fade-out 350ms ease forwards" : undefined,
        }}
        aria-hidden="true"
      >
        {/* ── Reduced-motion path: plain logo fade ── */}
        {reduced ? (
          <img
            src={logo}
            alt="Roam Machu"
            draggable={false}
            style={{
              width: 208,
              animation: "rm-logo-fade 600ms ease forwards",
            }}
          />
        ) : (
          /* ── Full animation path ── */
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20,
            }}
          >
            {/* Pin — visible during "pin" and "ripple" phases */}
            {(phase === "pin" || phase === "ripple") && (
              <div style={{ position: "relative", width: 64, height: 80 }}>
                <img
                  src={pinImg}
                  alt=""
                  draggable={false}
                  style={{
                    width: 64,
                    height: 80,
                    objectFit: "contain",
                    transformOrigin: "bottom center",
                    animation:
                      "rm-pin-drop 700ms cubic-bezier(0.34,1.45,0.64,1) forwards",
                  }}
                />

                {/* Ripple rings — visible only during "ripple" phase */}
                {phase === "ripple" && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: -4,
                        width: 48,
                        height: 48,
                        marginLeft: -24,
                        marginBottom: -24,
                        borderRadius: "50%",
                        background: "rgba(255,77,22,0.28)",
                        animation:
                          "rm-ripple 520ms ease-out forwards",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: -4,
                        width: 48,
                        height: 48,
                        marginLeft: -24,
                        marginBottom: -24,
                        borderRadius: "50%",
                        background: "rgba(255,77,22,0.18)",
                        animation:
                          "rm-ripple 520ms 110ms ease-out forwards",
                      }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Logo — visible during "logo" and "out" phases */}
            {(phase === "logo" || phase === "out") && (
              <img
                src={logo}
                alt="Roam Machu"
                draggable={false}
                style={{
                  width: 208,
                  animation: "rm-logo-in 400ms cubic-bezier(0.34,1.2,0.64,1) forwards",
                }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}
