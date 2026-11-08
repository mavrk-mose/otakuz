"use client";

import { EmptyState } from "@/components/empty-state";
import { HistorySkeleton } from "@/components/skeletons/history-skeleton";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Clock,
  ExternalLink,
  History,
  Lock,
  Newspaper,
  Radio,
  Search,
  Trash2,
  Tv2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";
import { useWatchHistory } from "@/hooks/use-watch-history";
import type { WatchHistoryItem, WatchHistoryType } from "@/lib/watch-history";

interface WatchHistoryProps {
  userId?: string;
  isOwnProfile?: boolean;
}

type FilterValue = "all" | WatchHistoryType;

const TYPE_META: Record<
  WatchHistoryType,
  {
    label: string;
    labelJa: string;
    icon: typeof Tv2;
    badgeClass: string;
  }
> = {
  anime: {
    label: "Anime",
    labelJa: "アニメ",
    icon: Tv2,
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-500",
  },
  manga: {
    label: "Manga",
    labelJa: "マンガ",
    icon: BookOpen,
    badgeClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400",
  },
  news: {
    label: "News",
    labelJa: "ニュース",
    icon: Newspaper,
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  channel: {
    label: "Channel",
    labelJa: "チャンネル",
    icon: Radio,
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

function formatRelativeTime(timestampMs: number, locale: string): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - timestampMs) / 1000));
  if (diffSec < 45) return locale === "ja" ? "たった今" : "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return locale === "ja" ? `${diffMin}分前` : `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return locale === "ja" ? `${diffHr}時間前` : `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return locale === "ja" ? `${diffDay}日前` : `${diffDay}d ago`;

  return new Date(timestampMs).toLocaleDateString(
    locale === "ja" ? "ja-JP" : "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function getDateBucket(timestampMs: number, locale: string): string {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

  if (timestampMs >= startOfToday) {
    return locale === "ja" ? "今日" : "Today";
  }
  if (timestampMs >= startOfYesterday) {
    return locale === "ja" ? "昨日" : "Yesterday";
  }
  return locale === "ja" ? "以前" : "Earlier";
}

function HistoryThumbnail({ item }: { item: WatchHistoryItem }) {
  const [imgError, setImgError] = useState(false);
  const Icon = TYPE_META[item.type]?.icon || History;

  if (!item.image || imgError) {
    return (
      <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-border",
        item.type === "channel" ? "bg-card" : "bg-muted"
      )}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        sizes="96px"
        onError={() => setImgError(true)}
        className={cn(
          "transition-transform duration-300 group-hover:scale-105",
          item.type === "channel" ? "object-contain p-2.5" : "object-cover"
        )}
      />
    </div>
  );
}

export function WatchHistory({ userId, isOwnProfile = true }: WatchHistoryProps) {
  const { locale } = useI18n();
  const { items, loading, removeItem, clearAll } = useWatchHistory(userId);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const counts = useMemo(() => {
    const map: Record<FilterValue, number> = {
      all: items.length,
      anime: 0,
      manga: 0,
      news: 0,
      channel: 0,
    };
    for (const item of items) {
      if (map[item.type] !== undefined) {
        map[item.type] += 1;
      }
    }
    return map;
  }, [items]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeFilter !== "all" && item.type !== activeFilter) {
        return false;
      }
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      );
    });
  }, [activeFilter, items, searchQuery]);

  const groupedItems = useMemo(() => {
    const groups: { label: string; entries: WatchHistoryItem[] }[] = [];
    const indexByLabel = new Map<string, number>();

    for (const entry of filteredItems) {
      const label = getDateBucket(entry.viewedAtMs, locale);
      const existingIdx = indexByLabel.get(label);
      if (existingIdx === undefined) {
        indexByLabel.set(label, groups.length);
        groups.push({ label, entries: [entry] });
      } else {
        groups[existingIdx].entries.push(entry);
      }
    }
    return groups;
  }, [filteredItems, locale]);

  if (!isOwnProfile) {
    return (
      <Card className="rounded-2xl border-border bg-card p-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-foreground">
          {locale === "ja" ? "視聴履歴は非公開です" : "Watch History is Private"}
        </h3>
        <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
          {locale === "ja"
            ? "各メンバーの閲覧・視聴ログは本人のみが確認できます。"
            : "Viewing and reading logs are private to each member."}
        </p>
      </Card>
    );
  }

  const handleRemove = async (id: string) => {
    try {
      await removeItem(id);
      toast.success(
        locale === "ja" ? "履歴から削除しました" : "Removed from watch history"
      );
    } catch {
      toast.error(
        locale === "ja" ? "削除に失敗しました" : "Failed to remove item"
      );
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAll();
      setConfirmClearOpen(false);
      toast.success(
        locale === "ja" ? "視聴履歴をすべて消去しました" : "Watch history cleared"
      );
    } catch {
      toast.error(
        locale === "ja" ? "履歴の消去に失敗しました" : "Failed to clear watch history"
      );
    } finally {
      setIsClearing(false);
    }
  };

  const filterTabs: { value: FilterValue; label: string; icon: typeof History }[] = [
    { value: "all", label: locale === "ja" ? "すべて" : "All", icon: History },
    { value: "anime", label: locale === "ja" ? "アニメ" : "Anime", icon: Tv2 },
    { value: "manga", label: locale === "ja" ? "マンガ" : "Manga", icon: BookOpen },
    { value: "news", label: locale === "ja" ? "ニュース" : "News", icon: Newspaper },
    { value: "channel", label: locale === "ja" ? "チャンネル" : "Channels", icon: Radio },
  ];

  if (loading && items.length === 0) return <HistorySkeleton />;

  if (items.length === 0) {
    return (
      <Card className="rounded-2xl border-border bg-card p-10 text-center sm:p-12">
        <EmptyState
          illustration="history"
          title={locale === "ja" ? "まだ履歴がありません" : "Your Watch & Activity Log is Empty"}
          description={locale === "ja"
            ? "アニメ、マンガ、ニュース、ライブチャンネルを開くと自動的にここへ記録され、いつでも見返すことができます。"
            : "Anything you open across Anime, Manga, News, or Live Channels is automatically logged here so you can jump right back anytime."}
          className="py-0"
        />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border bg-card hover:bg-muted">
            <Link href="/anime">
              <Tv2 className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
              Anime
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border bg-card hover:bg-muted">
            <Link href="/manga">
              <BookOpen className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
              Manga
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border bg-card hover:bg-muted">
            <Link href="/news">
              <Newspaper className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              News
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="rounded-xl border-border bg-card hover:bg-muted">
            <Link href="/channels">
              <Radio className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
              Channels
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar: Filters + Search + Clear */}
      <Card className="rounded-2xl border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.value;
              const count = counts[tab.value];
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveFilter(tab.value)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all",
                    isActive
                      ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                      : "border-border bg-background/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px]",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Clear */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "ja" ? "履歴を検索..." : "Search history..."}
                className="h-9 rounded-xl border-border bg-background/60 pl-8 text-xs"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmClearOpen(true)}
              className="h-9 shrink-0 rounded-xl border-border bg-background/60 text-xs text-muted-foreground hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-500"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              <span>{locale === "ja" ? "履歴を消去" : "Clear"}</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Filtered Results */}
      {filteredItems.length === 0 ? (
        <Card className="rounded-2xl border-dashed border-border bg-card/60 p-10 text-center">
          <p className="text-sm font-medium text-foreground">
            {locale === "ja"
              ? "条件に一致する履歴が見つかりませんでした"
              : "No matching items in your history"}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveFilter("all");
              setSearchQuery("");
            }}
            className="mt-2 text-xs text-rose-500 hover:text-rose-600"
          >
            {locale === "ja" ? "フィルターをリセット" : "Reset filters"}
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedItems.map((group) => (
            <div key={group.label} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <Clock className="h-3.5 w-3.5 text-rose-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </h3>
                <div className="h-px flex-1 bg-border/70" />
              </div>

              <div className="space-y-2.5">
                {group.entries.map((entry) => {
                  const meta = TYPE_META[entry.type] || TYPE_META.anime;
                  const TypeIcon = meta.icon;

                  const cardInner = (
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <HistoryThumbnail item={entry} />

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              meta.badgeClass
                            )}
                          >
                            <TypeIcon className="h-3 w-3" />
                            <span>{locale === "ja" ? meta.labelJa : meta.label}</span>
                          </span>

                          <span className="text-[11px] text-muted-foreground">
                            {formatRelativeTime(entry.viewedAtMs, locale)}
                          </span>

                          {(entry.viewCount || 1) > 1 && (
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              {locale === "ja"
                                ? `${entry.viewCount}回閲覧`
                                : `Visited ${entry.viewCount}×`}
                            </span>
                          )}
                        </div>

                        <h4 className="flex items-center gap-1.5 truncate text-sm font-bold text-foreground transition-colors group-hover:text-rose-500 sm:text-base">
                          <span className="truncate">{entry.title}</span>
                          {entry.isExternal ? (
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 text-rose-500" />
                          )}
                        </h4>

                        {entry.subtitle ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {entry.subtitle}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );

                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group relative flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 transition-all hover:border-rose-500/40 hover:bg-muted/30 hover:shadow-md"
                    >
                      {entry.isExternal ? (
                        <a
                          href={entry.href}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-w-0 flex-1 items-center"
                        >
                          {cardInner}
                        </a>
                      ) : (
                        <Link
                          href={entry.href}
                          className="flex min-w-0 flex-1 items-center"
                        >
                          {cardInner}
                        </Link>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => void handleRemove(entry.id)}
                        title={locale === "ja" ? "履歴から削除" : "Remove from history"}
                        aria-label={locale === "ja" ? "履歴から削除" : "Remove from history"}
                        className="h-8 w-8 shrink-0 rounded-xl text-muted-foreground opacity-70 transition hover:bg-rose-500/10 hover:text-rose-500 group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clear All Confirmation Dialog */}
      <Dialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <DialogContent className="rounded-2xl border-border bg-card text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {locale === "ja" ? "視聴履歴をすべて消去しますか？" : "Clear all watch history?"}
            </DialogTitle>
            <DialogDescription>
              {locale === "ja"
                ? "アニメ・マンガ・ニュース・チャンネルの閲覧ログがすべて削除されます。この操作は元に戻せません。"
                : "This will permanently clear your entire log of viewed anime, manga, news dispatches, and channels."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmClearOpen(false)}
              disabled={isClearing}
              className="rounded-xl border-border"
            >
              {locale === "ja" ? "キャンセル" : "Cancel"}
            </Button>
            <Button
              type="button"
              onClick={() => void handleClearAll()}
              disabled={isClearing}
              className="rounded-xl bg-rose-500 text-white hover:bg-rose-600"
            >
              {isClearing
                ? locale === "ja"
                  ? "消去中..."
                  : "Clearing..."
                : locale === "ja"
                  ? "すべて消去"
                  : "Clear History"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
