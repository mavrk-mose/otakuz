"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, SearchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearchModal } from "@/components/global-search-modal";
import { useGlobalSearchStore } from "@/store/use-global-search-store";

export function Search() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isExpanded = useSidebarStore(state => state.isExpanded);
  const { t } = useI18n();
  const fixedHeader = pathname === "/" || ["/anime", "/manga", "/news", "/events", "/shop"].some(path => pathname === path || pathname.startsWith(`${path}/`));
  const openSearch = useGlobalSearchStore((state) => state.openSearch);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent));
    }
  }, []);

  return (
    <>
      <div className={cn("hidden lg:block", fixedHeader && "h-16")}>
        <header className={cn(
          "top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          fixedHeader ? "fixed right-0 transition-[left] duration-300 ease-in-out" : "sticky",
          fixedHeader && (isExpanded ? "left-[240px]" : "left-[72px]")
        )}>
          <div className="container flex h-16 items-center justify-between gap-4 px-4">
            <nav aria-label={t("common.pageNavigation")} className="flex shrink-0 items-center gap-1">
              <Button type="button" variant="ghost" size="icon" aria-label={t("common.goBack")} title={t("common.goBack")} onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label={t("common.goForward")} title={t("common.goForward")} onClick={() => router.forward()}>
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </nav>

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
