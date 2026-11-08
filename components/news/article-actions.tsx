"use client";
import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";

import { useState } from "react";
import { Bookmark, Check, Gift, Link2, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";

type ArticleActionsProps = {
  commentsCount: number;
  title: string;
};

export function ArticleActions({ commentsCount, title }: ArticleActionsProps) {
  const { t: localizedT } = useI18n();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      toast.success("Article link copied to clipboard");
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareArticle = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
        return;
      } catch {
        // User cancelled or unsupported
      }
    }
    await copyLink();
  };

  const giftArticle = () => {
    copyLink();
    toast.info("Subscriber gift link generated & copied!");
  };

  const toggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      toast.success(next ? "Saved to your reading list" : "Removed from reading list");
      return next;
    });
  };

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-2.5 backdrop-blur-sm"
      aria-label={localizedT("news.articleActions")}
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={copyLink}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title={localizedT("news.copyLink")}
          aria-label={localizedT("news.copyLinkLabel")}
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Link2 className="h-4 w-4" />
          )}
        </button>

        <button
          type="button"
          onClick={shareArticle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title={localizedT("news.shareArticle")}
          aria-label={localizedT("news.shareArticleLabel")}
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={giftArticle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title={localizedT("news.giftAccess")}
          aria-label={localizedT("news.giftArticle")}
        >
          <Gift className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={toggleBookmark}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title={isBookmarked ? "Remove Bookmark" : "Bookmark Article"}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
        >
          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current text-[#ff5543]" : ""}`} />
        </button>
      </div>

      <a
        href="#comments"
        className="group flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium transition hover:border-rose-500/40 hover:bg-rose-500 hover:text-white"
      >
        <MessageSquare className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 group-hover:text-white" />
        <span className="font-mono font-bold text-amber-500 dark:text-amber-400 group-hover:text-white">
          {commentsCount}
        </span>
        <span className="text-muted-foreground group-hover:text-white">
          <I18nText message="news.commentsLabel" />
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase text-emerald-500 group-hover:text-white">
          (Live)
        </span>
      </a>
    </div>
  );
}
