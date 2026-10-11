import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";

import appCss from "../styles.css?url";
import logoIcon from "@/assets/logo-header.png";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Splash } from "@/components/Splash";
import { BottomNav, DesktopSidebar } from "@/components/BottomNav";
import { CommentsDrawer, ShareDrawer } from "@/components/CommentsDrawer";
import { NotificationsSheet, SettingsSheet } from "@/components/DemoModals";
import { getResolvedTheme, syncThemeDom, useTheme } from "@/hooks/use-theme";

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light";var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",d?"#000000":"#FFFFFF");}catch(e){}try{if(sessionStorage.getItem("roam-splash-seen"))document.documentElement.setAttribute("data-splash-seen","1");}catch(e){}})();`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold text-foreground">404 — Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="tap-scale inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="tap-scale inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="tap-scale inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Roam Machu" },
      { name: "description", content: "Roam Machu — the travel-only social app." },
      { property: "og:title", content: "Roam Machu" },
      { property: "og:description", content: "Roam Machu — the travel-only social app." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Roam Machu" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#FFFFFF" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: logoIcon },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { theme } = useTheme();
  const gPressedRef = useRef<number>(0);

  useEffect(() => {
    syncThemeDom(getResolvedTheme());
  }, [pathname, theme]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const now = Date.now();

      if (key === "g") {
        gPressedRef.current = now;
        return;
      }

      if (now - gPressedRef.current < 1000) {
        gPressedRef.current = 0;
        if (key === "h") {
          e.preventDefault();
          navigate({ to: "/" });
          return;
        }
        if (key === "e") {
          e.preventDefault();
          navigate({ to: "/explore" });
          return;
        }
        if (key === "r") {
          e.preventDefault();
          navigate({ to: "/reels" });
          return;
        }
      }

      if (key === "c") {
        e.preventDefault();
        navigate({ to: "/create" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  const isReels = pathname.startsWith("/reels");

  return (
    <QueryClientProvider client={queryClient}>
      <Splash />
      <DesktopSidebar />
      <main
        className={
          isReels
            ? "relative mx-auto min-h-dvh max-w-md bg-background pb-0 shadow-card lg:mx-0 lg:max-w-none lg:pl-[260px] lg:shadow-none"
            : "relative mx-auto min-h-dvh max-w-md bg-background pb-[var(--bottom-nav-clearance)] shadow-card lg:mx-0 lg:max-w-none lg:pb-0 lg:pl-[260px] lg:shadow-none"
        }
      >
        <div key={pathname} className="animate-page-enter">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      <CommentsDrawer />
      <ShareDrawer />
      <SettingsSheet />
      <NotificationsSheet />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
