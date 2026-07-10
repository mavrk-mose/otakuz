"use client";

import { useState } from "react";
import { Bookmark, Check, Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";

type ArticleActionsProps = {
  commentsCount: number;
  title: string;
};

const actionClassName =
  "inline-flex h-11 w-11 items-center justify-center rounded-full border border-current/20 transition hover:-translate-y-0.5 hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current dark:hover:bg-white/10";

export function ArticleActions({ commentsCount, title }: ArticleActionsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    toast.success("Article link copied");
    window.setTimeout(() => setIsCopied(false), 2000);
  };

  const shareArticle = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
      return;
    }

    await copyLink();
  };

  return (
    <div className="flex flex-wrap items-center gap-3" aria-label="Article actions">
      <button type="button" onClick={copyLink} className={actionClassName} aria-label="Copy article link">
        {isCopied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      </button>
      <button type="button" onClick={shareArticle} className={actionClassName} aria-label="Share article">
        <Share2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setIsBookmarked((value) => !value)}
        className={actionClassName}
        aria-label={isBookmarked ? "Remove bookmark" : "Bookmark article"}
        aria-pressed={isBookmarked}
      >
        <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
      </button>
      <span className="mx-1 h-7 w-px bg-current/20" aria-hidden="true" />
      <span className="inline-flex items-center gap-2 text-sm font-semibold">
        <MessageCircle className="h-4 w-4" />
        {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
      </span>
    </div>
  );
}
