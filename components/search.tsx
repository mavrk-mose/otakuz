"use client";

import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearchModal } from "@/components/global-search-modal";
import { useGlobalSearchStore } from "@/store/use-global-search-store";

export function Search() {
  const { user } = useAuth();
  const openSearch = useGlobalSearchStore((state) => state.openSearch);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  return (
    <>
      <div className="hidden lg:block">
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container flex h-16 items-center justify-between gap-4 px-4">
            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openSearch()}
                aria-label="Open global search"
                className="group flex h-10 w-72 items-center justify-between gap-3 rounded-xl border border-border bg-card px-3.5 text-left text-xs text-muted-foreground shadow-sm transition hover:border-rose-500/40 hover:bg-muted/50 hover:text-foreground xl:w-96"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-rose-500" />
                  <span className="truncate">
                    Search anime, users, merch, events, channels...
                  </span>
                </span>

                <kbd className="inline-flex shrink-0 items-center gap-0.5 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
                  {isMac ? "⌘K" : "Ctrl K"}
                </kbd>
              </button>

              {user && <NotificationBell />}
              <ThemeToggle />
            </div>
          </div>
        </header>
      </div>

      {/* Mounted globally for both desktop and mobile viewports */}
      <GlobalSearchModal />
    </>
  );
}
