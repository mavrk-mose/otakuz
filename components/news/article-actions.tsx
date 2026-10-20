"use client";

import { useState } from "react";
import { Bookmark, Check, Gift, Link2, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";

type ArticleActionsProps = {
  commentsCount: number;
  title: string;
};

export function ArticleActions({ commentsCount, title }: ArticleActionsProps) {
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
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-muted/40 p-2.5 backdrop-blur-sm"
      aria-label="Article actions"
    >
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={copyLink}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title="Copy Link"
          aria-label="Copy link"
        >
          {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Link2 className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={shareArticle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title="Share Article"
          aria-label="Share article"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={giftArticle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card hover:text-foreground"
          title="Gift Access"
          aria-label="Gift article"
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
        className="group flex items-center gap-2 rounded-full border border-white/5 bg-card px-3.5 py-1 text-xs font-medium transition hover:border-[#ff5543]/40 hover:bg-[#ff5543] hover:text-white"
      >
        <MessageSquare className="h-3.5 w-3.5 text-[#ffb95f] group-hover:text-white" />
        <span className="font-mono font-bold text-[#ffb95f] group-hover:text-white">{commentsCount}</span>
        <span className="text-muted-foreground group-hover:text-white">Comments</span>
        <span className="font-mono text-[10px] font-semibold uppercase text-[#27c93f] group-hover:text-white">
          (Live)
        </span>
      </a>
    </div>
  );
}
