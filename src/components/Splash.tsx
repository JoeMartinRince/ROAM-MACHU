import { useEffect, useState } from "react";
import logoLight from "@/assets/logo-splash.png";
import logoDark from "@/assets/logo-dark.png";
import pinImg from "@/assets/logo-pin.png";

const SEEN_KEY = "roam-splash-seen";
const TOTAL_MS = 1850; // splash unmounts after this

// Where the logo's own pin sits inside the logo image (percent of logo size).
// The dropped pin is an exact copy of it, so it lands precisely in the "o" of "Roam".
const PIN = { left: 25.9, top: 11.2, width: 19.4 };

export function Splash() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Only play once per browser session
    try {
      if (sessionStorage.getItem(SEEN_KEY)) {
        setShow(false);
        return;
      }
    } catch {
      /* storage unavailable: just play it */
    }
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setShow(false);
    }, TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;

  return (
    <div
      aria-hidden="true"
      className="rm-splash fixed inset-0 z-[2000] grid place-items-center overflow-hidden bg-cream dark:bg-black"
    >
      <style>{CSS}</style>

      <div className="relative w-64">
        {/* full logo, fades in around the pin */}
        <div className="rm-logo relative z-[5]">
          <img src={logoLight} alt="Roam Machu" className="block w-full dark:hidden" />
          <img src={logoDark} alt="Roam Machu" className="hidden w-full dark:block" />
        </div>

        {/* pin + ground effects, positioned exactly over the logo's pin */}
        <div
          className="absolute"
          style={{ left: `${PIN.left}%`, top: `${PIN.top}%`, width: `${PIN.width}%` }}
        >
          <span className="rm-shadow absolute left-1/2 top-full z-0 -mt-0.5 h-2.5 w-[95%] rounded-full bg-black/25 dark:bg-white/10" />
          <span
            className="rm-ring absolute left-1/2 top-full z-0 -mt-0.5 rounded-full border-2 border-[#FF5A1F]"
            style={{ width: "230%", aspectRatio: "1" }}
          />
          <span
            className="rm-ring rm-ring-2 absolute left-1/2 top-full z-0 -mt-0.5 rounded-full border-2 border-[#00B3A4]"
            style={{ width: "230%", aspectRatio: "1" }}
          />
          <img src={pinImg} alt="" className="rm-pin relative z-10 block h-auto w-full" />
        </div>
      </div>
    </div>
  );
}

const CSS = `
.rm-splash { animation: rm-out 350ms ease-in 1500ms forwards; }
@keyframes rm-out { to { opacity: 0; } }

/* pin: drop into the "o", squash, bounce twice, settle */
.rm-pin { opacity: 0; transform-origin: 50% 100%; animation: rm-drop 1000ms forwards; }
@keyframes rm-drop {
  0%   { opacity: 0; transform: translateY(-60vh) scale(1,1); animation-timing-function: cubic-bezier(.5,0,.9,.5); }
  8%   { opacity: 1; }
  45%  { opacity: 1; transform: translateY(0) scale(1.18,.82); animation-timing-function: cubic-bezier(.2,.6,.4,1); }
  60%  { opacity: 1; transform: translateY(-30px) scale(.96,1.06); animation-timing-function: cubic-bezier(.6,0,.9,.5); }
  74%  { opacity: 1; transform: translateY(0) scale(1.08,.92); }
  84%  { opacity: 1; transform: translateY(0) scale(1,1); }
  100% { opacity: 1; transform: translateY(0) scale(1,1); }
}

/* ground shadow grows as the pin nears the ground */
.rm-shadow { opacity: 0; transform: translateX(-50%) scale(.2); animation: rm-shadow 1100ms ease-out forwards; }
@keyframes rm-shadow {
  0%   { opacity: 0;  transform: translateX(-50%) scale(.2); }
  41%  { opacity: .9; transform: translateX(-50%) scale(1.1); }
  55%  { opacity: .5; transform: translateX(-50%) scale(.7); }
  68%  { opacity: .9; transform: translateX(-50%) scale(1); }
  100% { opacity: 0;  transform: translateX(-50%) scale(1); }
}

/* ground ripples (flattened rings) */
.rm-ring { opacity: 0; transform: translate(-50%,-50%) scale(.1,.035); animation: rm-ping 950ms cubic-bezier(.1,.6,.3,1) 450ms forwards; }
.rm-ring-2 { animation-delay: 650ms; }
@keyframes rm-ping {
  0%   { opacity: .75; transform: translate(-50%,-50%) scale(.1,.035); }
  100% { opacity: 0;   transform: translate(-50%,-50%) scale(2.6,.9); }
}

/* wordmark fades in (opacity + de-blur only, so the logo's pin stays aligned with the dropped one) */
.rm-logo { opacity: 0; filter: blur(6px); animation: rm-logo 450ms ease-out 850ms forwards; }
@keyframes rm-logo { to { opacity: 1; filter: blur(0); } }

/* reduced motion: skip the drop, just fade the logo in */
@media (prefers-reduced-motion: reduce) {
  .rm-pin, .rm-shadow, .rm-ring { display: none; }
  .rm-logo { filter: none; animation: rm-fade 400ms ease-out 100ms forwards; }
  @keyframes rm-fade { to { opacity: 1; } }
}
`;
