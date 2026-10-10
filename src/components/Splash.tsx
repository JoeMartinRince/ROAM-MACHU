import { useEffect, useState } from "react";
import logo from "@/assets/logo-splash.png";
import logoDark from "@/assets/logo-dark.png";

export function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1500);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center bg-cream dark:bg-[#000000] animate-out fade-out delay-1000 duration-500 fill-mode-forwards">
      <img
        src={logo}
        alt="Roam Machu"
        className="w-64 animate-in zoom-in-90 duration-700 dark:hidden"
      />
      <img
        src={logoDark}
        alt="Roam Machu"
        className="hidden w-64 animate-in zoom-in-90 duration-700 dark:block"
      />
    </div>
  );
}
