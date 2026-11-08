"use client";
import { I18nText } from "@/components/i18n-text";


import Image from "next/image";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { type NewsStory } from "@/types/news";
import { useI18n } from "@/components/i18n-provider";

interface StreamCardProps {
  id: string;
  title: string;
  author: string;
  time?: string;
  comments: number;
  tag: string;
  image?: string;
}

interface TodaysProps {
  stories?: NewsStory[];
}

const StreamCard = ({ id, title, author, time, comments, tag, image }: StreamCardProps) => {
  return (
    <Link
      href={`/news/${encodeURIComponent(id)}`}
      className="group flex items-start justify-between gap-4 border-b border-border/80 p-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-1.5">
        <span className="font-mono text-xs uppercase tracking-wider text-rose-500 font-semibold">{tag}</span>
        <h3 className="line-clamp-2 text-sm font-bold text-foreground transition-colors group-hover:text-rose-500">
          {title}
        </h3>
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="text-amber-500 dark:text-amber-400 font-medium">{author}</span>
          {time && (
            <>
              <span>•</span>
              <span>{time}</span>
            </>
          )}
          <span>•</span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3 text-rose-500" />
            {comments}
          </span>
        </div>
      </div>

      {image && (
        <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={image}
            alt={title}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      )}
    </Link>
  );
};

const TodaysStream = ({ stories = [] }: TodaysProps) => {
  const { locale, t } = useI18n();
  return (
    <div className="space-y-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
            {t("news.todayStream")}
          </h2>
        </div>
        <span className="font-mono text-[11px] font-semibold text-amber-500 dark:text-amber-400"><I18nText message="news.realtime" /></span>
      </div>
      <div className="divide-y divide-border">
        {stories.map((story) => (
          <StreamCard
            key={story._id}
            id={story._id}
            title={story.title}
            author={story.authorName || story.author?.name || t("news.staff")}
            time={
              story.publishedAt
                ? new Date(story.publishedAt).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : undefined
            }
            comments={story.commentsCount || 0}
            tag={story.tag || "Editorial"}
            image={story.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default TodaysStream;
