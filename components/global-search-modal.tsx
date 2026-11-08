"use client";

import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";


import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  CornerDownLeft,
  History,
  Layers,
  Loader2,
  Lock,
  MessageSquare,
  PartyPopper,
  Radio,
  Search as SearchIcon,
  ShoppingBag,
  SlidersHorizontal,
  Tv2,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ALL_SEARCH_CATEGORIES,
  type GlobalSearchCategory,
  type SearchScopeTab,
  useGlobalSearchStore,
} from "@/store/use-global-search-store";
import {
  type GlobalSearchItem,
  useGlobalSearch,
} from "@/hooks/search/use-global-search";

const CATEGORY_CONFIG: Record<
  GlobalSearchCategory,
  {
    label: string;
    icon: typeof Tv2;
    accentClass: string;
  }
> = {
  anime: {
    label: "Anime",
    icon: Tv2,
    accentClass: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  },
  manga: {
    label: "Manga",
    icon: BookOpen,
    accentClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
  },
  users: {
    label: "Users",
    icon: Users,
    accentClass: "border-pink-500/30 bg-pink-500/10 text-pink-500",
  },
  merch: {
    label: "Merch",
    icon: ShoppingBag,
    accentClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  events: {
    label: "Events",
    icon: PartyPopper,
    accentClass: "border-purple-500/30 bg-purple-500/10 text-purple-500 dark:text-purple-400",
  },
  channels: {
    label: "Channels",
    icon: Radio,
    accentClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  chatrooms: {
    label: "Chatrooms",
    icon: MessageSquare,
    accentClass: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  },
};

const QUICK_JUMP_LINKS: GlobalSearchItem[] = [
  {
    id: "quick-community",
    category: "users",
    title: "Browse All Community Profiles",
    subtitle: "Explore every public member & saved board directory",
    badge: "Directory",
    href: "/community",
  },
  {
    id: "quick-channels",
    category: "channels",
    title: "Live Animation TV Channels",
    subtitle: "Watch 24/7 global anime & cartoon broadcasts",
    badge: "LIVE",
    href: "/channels",
  },
  {
    id: "quick-shop",
    category: "merch",
    title: "Otakuz Merch & Collectibles Shop",
    subtitle: "Figures, apparel, posters, and official gear",
    badge: "Shop",
    href: "/shop",
  },
  {
    id: "quick-events",
    category: "events",
    title: "Upcoming Conventions & Meetups",
    subtitle: "Discover local and global anime community events",
    badge: "Events",
    href: "/events",
  },
  {
    id: "quick-chat",
    category: "chatrooms",
    title: "Community Live Chatrooms",
    subtitle: "Join real-time discussions with fellow otakus",
    badge: "Chat",
    href: "/chat",
  },
  {
    id: "quick-history",
    category: "anime",
    title: "My Profile & Watch History",
    subtitle: "Review everything you have watched, read, and opened",
    badge: "Profile",
    href: "/profile",
  },
];

function ResultThumbnail({ item }: { item: GlobalSearchItem }) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_CONFIG[item.category]?.icon || Layers;

  if (!item.image || failed) {
    return (
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center border border-border bg-muted/60 text-muted-foreground",
          item.category === "users" ? "rounded-full" : "rounded-xl"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-11 w-11 shrink-0 overflow-hidden border border-border",
        item.category === "users" ? "rounded-full bg-muted" : "rounded-xl",
        item.category === "channels" ? "bg-card" : "bg-muted"
      )}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="44px"
        onError={() => setFailed(true)}
        className={cn(
          item.category === "channels" ? "object-contain p-1.5" : "object-cover"
        )}
      />
    </div>
  );
}

export function GlobalSearchModal() {
  const { t: localizedT } = useI18n();
  const router = useRouter();
  const {
    isOpen,
    query,
    focusedCategory,
    enabledCategories,
    recentSearches,
    openSearch,
    closeSearch,
    toggleSearch,
    setQuery,
    setFocusedCategory,
    toggleEnabledCategory,
    enableAllCategories,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  } = useGlobalSearchStore();

  const [showScopeCustomizer, setShowScopeCustomizer] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const { sections, flatItems, isAnyFetching, isAllSettledEmpty, retryFailedSearch } = useGlobalSearch({
    rawQuery: query,
    isOpen,
    focusedCategory,
    enabledCategories,
  });

  const visibleScopeTabs = useMemo<SearchScopeTab[]>(() => {
    return ["all", ...ALL_SEARCH_CATEGORIES.filter((c) => enabledCategories.includes(c))];
  }, [enabledCategories]);

  const trimmedQuery = query.trim();

  // Keyboard navigable list: either live search results OR quick links when input is empty
  const navigableItems = useMemo<GlobalSearchItem[]>(() => {
    if (trimmedQuery.length > 0) {
      return flatItems;
    }
    const recentAsItems: GlobalSearchItem[] = recentSearches.map((term) => ({
      id: `recent-${term}`,
      category: "anime",
      title: term,
      subtitle: "Recent search",
      href: `__search__:${term}`,
    }));
    return [...recentAsItems, ...QUICK_JUMP_LINKS];
  }, [flatItems, recentSearches, trimmedQuery.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery, focusedCategory]);

  useEffect(() => {
    if (activeIndex >= navigableItems.length && navigableItems.length > 0) {
      setActiveIndex(navigableItems.length - 1);
    }
  }, [activeIndex, navigableItems.length]);

  // Global keyboard shortcut listener: Cmd/Ctrl + K and `/`
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        toggleSearch();
        return;
      }

      if (
        !isOpen &&
        event.key === "/" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        const target = event.target as HTMLElement | null;
        const tagName = target?.tagName?.toLowerCase();
        const isEditable =
          tagName === "input" ||
          tagName === "textarea" ||
          tagName === "select" ||
          Boolean(target?.isContentEditable);

        if (!isEditable) {
          event.preventDefault();
          openSearch();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, openSearch, toggleSearch]);

  useEffect(() => {
    if (isOpen) {
      const id = window.requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      return () => window.cancelAnimationFrame(id);
    }
  }, [isOpen]);

  const handleSelectItem = useCallback(
    (item: GlobalSearchItem, openInNewTab = false) => {
      if (item.href.startsWith("__search__:")) {
        const term = item.href.replace("__search__:", "");
        setQuery(term);
        inputRef.current?.focus();
        return;
      }

      if (trimmedQuery.length >= 2) {
        addRecentSearch(trimmedQuery);
      }

      closeSearch();
      if (openInNewTab) {
        window.open(item.href, "_blank", "noopener,noreferrer");
      } else {
        router.push(item.href);
      }
    },
    [addRecentSearch, closeSearch, router, setQuery, trimmedQuery]
  );

  // Scroll active item into view smoothly when navigating with keyboard
  useEffect(() => {
    const activeItem = navigableItems[activeIndex];
    if (!activeItem) return;
    const node = itemRefs.current[activeItem.id];
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, navigableItems]);

  const handleModalKeyDown = (event: React.KeyboardEvent) => {
    // Move Down: ArrowDown or Ctrl+N
    if (
      event.key === "ArrowDown" ||
      (event.ctrlKey && event.key.toLowerCase() === "n")
    ) {
      event.preventDefault();
      if (navigableItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % navigableItems.length);
      }
      return;
    }

    // Move Up: ArrowUp or Ctrl+P
    if (
      event.key === "ArrowUp" ||
      (event.ctrlKey && event.key.toLowerCase() === "p")
    ) {
      event.preventDefault();
      if (navigableItems.length > 0) {
        setActiveIndex(
          (prev) => (prev - 1 + navigableItems.length) % navigableItems.length
        );
      }
      return;
    }

    // Open Active Item: Enter (Cmd/Ctrl+Enter opens in new tab)
    if (event.key === "Enter") {
      const selected = navigableItems[activeIndex];
      if (selected) {
        event.preventDefault();
        handleSelectItem(selected, event.metaKey || event.ctrlKey);
      }
      return;
    }

    // Cycle Scope Tabs: Tab / Shift+Tab
    if (event.key === "Tab" && visibleScopeTabs.length > 1) {
      event.preventDefault();
      const idx = visibleScopeTabs.indexOf(focusedCategory);
      const safeIdx = idx === -1 ? 0 : idx;
      const nextIdx = event.shiftKey
        ? (safeIdx - 1 + visibleScopeTabs.length) % visibleScopeTabs.length
        : (safeIdx + 1) % visibleScopeTabs.length;
      setFocusedCategory(visibleScopeTabs[nextIdx]);
      return;
    }

    // Direct Scope Jump: Alt + 1..8
    if (event.altKey && /^[1-8]$/.test(event.key)) {
      const targetIdx = Number(event.key) - 1;
      if (visibleScopeTabs[targetIdx]) {
        event.preventDefault();
        setFocusedCategory(visibleScopeTabs[targetIdx]);
      }
      return;
    }

    // Quick Clear Query: Ctrl+U
    if (event.ctrlKey && event.key.toLowerCase() === "u" && query) {
      event.preventDefault();
      setQuery("");
    }
  };

  // Precompute index lookup for fast active highlight check
  const indexMap = useMemo(() => {
    const map = new Map<string, number>();
    navigableItems.forEach((it, idx) => map.set(it.id, idx));
    return map;
  }, [navigableItems]);

  // Count per category for tab pills
  const categoryCountMap = useMemo(() => {
    const map: Partial<Record<GlobalSearchCategory, number>> = {};
    for (const sec of sections) {
      map[sec.category] = sec.items.length;
    }
    return map;
  }, [sections]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? openSearch() : closeSearch())}>
      <DialogContent
        onKeyDown={handleModalKeyDown}
        className="max-w-2xl gap-0 overflow-hidden rounded-2xl border-border bg-card p-0 text-foreground shadow-2xl [&>button]:hidden"
      >
        <DialogTitle className="sr-only"><I18nText message="search.global" /></DialogTitle>

        {/* Top Search Input Row */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
          {isAnyFetching ? (
            <Loader2 className="h-5 w-5 shrink-0 animate-spin text-rose-500" />
          ) : (
            <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={localizedT("search.globalPlaceholder")}
            aria-label={localizedT("search.queryLabel")}
            className="flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground sm:text-base"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label={localizedT("search.clearQuery")}
              className="rounded-lg p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <Button
            type="button"
            variant={showScopeCustomizer ? "default" : "outline"}
            size="sm"
            onClick={() => setShowScopeCustomizer((prev) => !prev)}
            title={localizedT("search.customize")}
            className={cn(
              "h-8 shrink-0 gap-1.5 rounded-xl px-2.5 text-xs font-semibold",
              showScopeCustomizer
                ? "bg-rose-500 text-white hover:bg-rose-600"
                : "border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline"><I18nText message="search.scopes" /></span>
            <span className="rounded bg-black/15 px-1 text-[10px] dark:bg-white/15">
              {enabledCategories.length}/{ALL_SEARCH_CATEGORIES.length}
            </span>
          </Button>
        </div>

        {/* Expandable Scope Customizer ("Adjust what you want to search for") */}
        {showScopeCustomizer && (
          <div className="border-b border-border bg-muted/40 px-4 py-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <I18nText message="search.sources" />
              </p>
              {enabledCategories.length < ALL_SEARCH_CATEGORIES.length && (
                <button
                  type="button"
                  onClick={enableAllCategories}
                  className="text-[11px] font-semibold text-rose-500 hover:underline"
                >
                  <I18nText message="search.enableAll" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {ALL_SEARCH_CATEGORIES.map((category) => {
                const cfg = CATEGORY_CONFIG[category];
                const Icon = cfg.icon;
                const enabled = enabledCategories.includes(category);
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleEnabledCategory(category)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition",
                      enabled
                        ? "border-rose-500/40 bg-rose-500/10 text-foreground"
                        : "border-border bg-card/50 text-muted-foreground opacity-65 hover:opacity-100"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded-sm border",
                        enabled
                          ? "border-rose-500 bg-rose-500 text-white"
                          : "border-muted-foreground/40"
                      )}
                    >
                      {enabled && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Scope Filter Tabs (Cycle with Tab / Shift+Tab) */}
        <ScrollArea controlSize="sm" className="w-full border-b border-border">
          <div className="flex w-max items-center gap-1.5 px-4 py-2">
          <button
            type="button"
            onClick={() => setFocusedCategory("all")}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition",
              focusedCategory === "all"
                ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                : "border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="h-3 w-3" />
            <span><I18nText message="search.all" /></span>
            {trimmedQuery.length > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-[10px]",
                  focusedCategory === "all"
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {flatItems.length}
              </span>
            )}
          </button>

          {ALL_SEARCH_CATEGORIES.filter((cat) =>
            enabledCategories.includes(cat)
          ).map((category) => {
            const cfg = CATEGORY_CONFIG[category];
            const Icon = cfg.icon;
            const isActive = focusedCategory === category;
            const count = categoryCountMap[category];

            return (
              <button
                key={category}
                type="button"
                onClick={() => setFocusedCategory(category)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-semibold transition",
                  isActive
                    ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                    : "border-border bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{cfg.label}</span>
                {trimmedQuery.length > 0 && count !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px]",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          </div>
        </ScrollArea>

        {/* Scrollable Results / Zero-Query Quick Palette */}
        <ScrollArea controlSize="sm" className="max-h-[62vh] p-3">
          {trimmedQuery.length === 0 ? (
            <div className="space-y-4">
              {recentSearches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <History className="h-3.5 w-3.5 text-rose-500" />
                      <I18nText message="search.recent" />
                    </span>
                    <button
                      type="button"
                      onClick={clearRecentSearches}
                      className="text-[11px] text-muted-foreground hover:text-rose-500"
                    >
                      <I18nText message="common.clear" />
                    </button>
                  </div>

                  {recentSearches.map((term) => {
                    const itemId = `recent-${term}`;
                    const itemIdx = indexMap.get(itemId) ?? -1;
                    const isHighlighted = itemIdx === activeIndex;
                    return (
                      <div
                        key={itemId}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2 transition",
                          isHighlighted ? "bg-muted text-foreground" : "hover:bg-muted/60"
                        )}
                      >
                        <button
                          ref={(el) => {
                            itemRefs.current[itemId] = el;
                          }}
                          type="button"
                          onMouseEnter={() => itemIdx >= 0 && setActiveIndex(itemIdx)}
                          onClick={() => {
                            setQuery(term);
                            inputRef.current?.focus();
                          }}
                          className="flex flex-1 items-center gap-2.5 text-left text-sm font-medium"
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{term}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeRecentSearch(term)}
                          aria-label={`Remove ${term} from recent searches`}
                          className="rounded p-1 text-muted-foreground hover:bg-background hover:text-rose-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="space-y-1.5">
                <div className="px-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <I18nText message="search.quickJump" />
                  </span>
                </div>

                {QUICK_JUMP_LINKS.map((item) => {
                  const cfg = CATEGORY_CONFIG[item.category];
                  const Icon = cfg.icon;
                  const itemIdx = indexMap.get(item.id) ?? -1;
                  const isHighlighted = itemIdx === activeIndex;

                  return (
                    <button
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[item.id] = el;
                      }}
                      type="button"
                      onMouseEnter={() => itemIdx >= 0 && setActiveIndex(itemIdx)}
                      onClick={(e) => handleSelectItem(item, e.metaKey || e.ctrlKey)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition",
                        isHighlighted
                          ? "bg-muted text-foreground shadow-sm"
                          : "hover:bg-muted/60"
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
                            cfg.accentClass
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isAllSettledEmpty && sections.some(section => section.isError) ? (
            <ErrorState compact onRetry={() => void retryFailedSearch()} />
          ) : isAllSettledEmpty ? (
            <EmptyState illustration="search" compact
              title={localizedT("search.noMatchesFor", { query: trimmedQuery })}
              description={localizedT("search.emptyDescription")}
              action={focusedCategory !== "all" ? <Button type="button" variant="ghost" size="sm" onClick={() => setFocusedCategory("all")} className="text-xs text-primary"><I18nText message="search.allScopes" /></Button> : undefined}
            />
          ) : (
            <div className="space-y-4">
              {sections.map((section) => {
                const cfg = CATEGORY_CONFIG[section.category];
                const SectionIcon = cfg.icon;

                if (
                  section.requiresAuth &&
                  focusedCategory === "chatrooms"
                ) {
                  return (
                    <div
                      key={section.category}
                      className="rounded-xl border border-border bg-muted/40 p-6 text-center"
                    >
                      <Lock className="mx-auto mb-2 h-5 w-5 text-amber-500" />
                      <p className="text-xs font-semibold text-foreground">
                        <I18nText message="search.signInRooms" />
                      </p>
                    </div>
                  );
                }

                if (
                  section.items.length === 0 &&
                  !section.isPending &&
                  !section.isFetching
                ) {
                  return null;
                }

                return (
                  <div key={section.category} className="space-y-1.5">
                    {/* Section Header */}
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-1.5">
                        <SectionIcon className="h-3.5 w-3.5 text-rose-500" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          {cfg.label}
                        </span>
                        {section.isFetching && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>

                      {focusedCategory === "all" && section.items.length >= 5 && (
                        <button
                          type="button"
                          onClick={() => setFocusedCategory(section.category)}
                          className="text-[11px] font-semibold text-rose-500 hover:underline"
                        >
                          <I18nText message="search.filterTo" /> {cfg.label} →
                        </button>
                      )}
                    </div>

                    {/* Async Streaming Placeholder while this specific source resolves */}
                    {section.items.length === 0 &&
                    (section.isPending || section.isFetching) ? (
                      <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-xs text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-rose-500" />
                        <span><I18nText message="search.searching" /> {cfg.label.toLowerCase()}...</span>
                      </div>
                    ) : (
                      section.items.map((item) => {
                        const itemIdx = indexMap.get(item.id) ?? -1;
                        const isHighlighted = itemIdx === activeIndex;

                        return (
                          <button
                            key={item.id}
                            ref={(el) => {
                              itemRefs.current[item.id] = el;
                            }}
                            type="button"
                            onMouseEnter={() =>
                              itemIdx >= 0 && setActiveIndex(itemIdx)
                            }
                            onClick={(e) =>
                              handleSelectItem(item, e.metaKey || e.ctrlKey)
                            }
                            className={cn(
                              "group flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition",
                              isHighlighted
                                ? "bg-muted text-foreground ring-1 ring-rose-500/40"
                                : "hover:bg-muted/60"
                            )}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                              <ResultThumbnail item={item} />

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-bold text-foreground group-hover:text-rose-500">
                                    {item.title}
                                  </p>
                                  {item.badge && (
                                    <span
                                      className={cn(
                                        "shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-bold",
                                        cfg.accentClass
                                      )}
                                    >
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="truncate text-xs text-muted-foreground">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>

                            <CornerDownLeft
                              className={cn(
                                "h-4 w-4 shrink-0 transition-opacity",
                                isHighlighted
                                  ? "text-rose-500 opacity-100"
                                  : "text-muted-foreground opacity-0 group-hover:opacity-60"
                              )}
                            />
                          </button>
                        );
                      })
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Keyboard Shortcuts Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                ↑↓
              </kbd>
              <span><I18nText message="search.navigate" /></span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                ↵
              </kbd>
              <span><I18nText message="search.open" /></span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                Tab
              </kbd>
              <span><I18nText message="search.switchScope" /></span>
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
                ⌘↵
              </kbd>
              <span><I18nText message="search.newTab" /></span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground">
              Esc
            </kbd>
            <span><I18nText message="common.closeLabel" /></span>
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
