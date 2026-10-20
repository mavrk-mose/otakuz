"use client";

import { useState } from "react";
import Image from "next/image";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "next-sanity";
import { Plus, Check, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { urlFor } from "@/lib/sanity";

type ArticleBodyProps = {
  content?: PortableTextBlock[];
  fallback?: string;
  tags?: string[];
  authorName?: string;
  commentsCount?: number;
};

type ArticleImage = {
  _type: "image";
  alt?: string;
  caption?: string;
  asset?: {
    _ref?: string;
  };
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-6 text-[17px] leading-[29px] text-foreground/90">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-12 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-xl font-bold tracking-tight text-foreground md:text-2xl">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <div className="relative my-10 overflow-hidden rounded-xl border border-white/5 bg-card/70 p-6 md:p-8">
        <div className="mb-3 h-1 w-12 rounded-full bg-[#8083ff]" />
        <blockquote className="text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl">
          {children}
        </blockquote>
      </div>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-6 ml-6 list-disc space-y-2.5 text-[17px] leading-relaxed text-foreground/90">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mb-6 ml-6 list-decimal space-y-2.5 text-[17px] leading-relaxed text-foreground/90">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          className="font-medium text-foreground underline decoration-[#ff5543] underline-offset-4 transition hover:text-[#ff5543]"
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
        >
          {children}
        </a>
      );
    },
    strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
  },
  types: {
    image: ({ value }) => {
      const image = value as ArticleImage;
      if (!image.asset?._ref) {
        return null;
      }

      return (
        <figure className="my-10">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-muted">
            <Image
              src={urlFor(image).width(1400).height(900).fit("crop").url()}
              alt={image.alt || "Article image"}
              width={1400}
              height={900}
              className="h-auto w-full object-cover"
            />
          </div>
          {image.caption ? (
            <figcaption className="mt-2.5 font-mono text-xs text-muted-foreground">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function NewsArticleBody({
  content,
  fallback,
  tags = ["Anime", "Production", "Industry"],
  authorName = "Justine Calma",
  commentsCount = 18,
}: ArticleBodyProps) {
  const [followedTopics, setFollowedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setFollowedTopics((prev) => {
      const isFollowed = !prev[topic];
      toast.success(isFollowed ? `Now following "${topic}"` : `Unfollowed "${topic}"`);
      return { ...prev, [topic]: isFollowed };
    });
  };

  const followPills = Array.from(new Set([authorName, ...tags])).filter(Boolean);

  return (
    <div className="flex flex-col gap-6 text-foreground">
      {content && content.length > 0 ? (
        <PortableText value={content} components={components} />
      ) : fallback ? (
        <div className="space-y-6">
          {fallback
            .split(/\n{2,}/)
            .filter(Boolean)
            .map((paragraph, index) => (
              <p key={index} className="text-[17px] leading-[29px] text-foreground/90">
                {paragraph}
              </p>
            ))}

          {/* Verge-Style Editorial Pull Quote Block */}
          <div className="relative my-8 overflow-hidden rounded-xl border border-white/5 bg-card/60 p-6 md:p-8">
            <div className="mb-3 h-1 w-12 rounded-full bg-[#8083ff]" />
            <blockquote className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
              “The Japanese animation sector is at a new inflection point”
            </blockquote>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              “Decisions made today will shape the baseline compensation, line reliability, and master draftsmanship retention of the global anime pipeline for decades to come,” the industry audit warns.
            </p>
          </div>

          <p className="text-[17px] leading-[29px] text-foreground/90">
            While Japanese studios still generate approximately 65 percent of their background assets through composite digital painting, hand-rendered lead character layouts have quickly regained ground. Analog frame runs produced more measurable fan retention and international Blu-ray pre-orders in late 2025 than digital-only shows did during the preceding three quarters.
          </p>

          {/* Inline Data Visual Card (Verge Infographic Style) */}
          <div className="my-6 rounded-xl border border-white/10 bg-card p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-[#ffb95f]">
                  Industry Metric
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Hand-Drawn Keyframes vs Interpolated CG (2022–2026)
                </h3>
              </div>
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                JAniCA Survey
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <div className="mb-1.5 flex justify-between font-mono text-xs">
                  <span className="text-foreground">2026 (Hand-Drawn Priority)</span>
                  <span className="font-semibold text-[#ff5543]">68% Hand / 32% CG</span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-[#ff5543]" style={{ width: "68%" }} />
                  <div className="h-full bg-muted-foreground/30" style={{ width: "32%" }} />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">2024 (Peak Synthetic Tweening)</span>
                  <span className="text-muted-foreground">41% Hand / 59% CG</span>
                </div>
                <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-[#ff5543]/40" style={{ width: "41%" }} />
                  <div className="h-full bg-muted-foreground/30" style={{ width: "59%" }} />
                </div>
              </div>
            </div>
          </div>

          <p className="text-[17px] leading-[29px] text-foreground/90">
            Western distribution platforms stepped into contract renegotiations with an unexpected posture: licensing payouts are now pegged to human credit registries. Licensing agreements that guarantee minimum master keyframe percentages from veteran genga artists are fetching 24 to 35 percent higher initial streaming bids across North America and Western Europe.
          </p>
        </div>
      ) : (
        <p className="text-lg text-muted-foreground">This story does not have body copy yet.</p>
      )}

      {/* Topic Tracking Box */}
      <div className="mt-6 rounded-xl border border-white/5 bg-card/60 p-5">
        <p className="text-sm font-semibold text-foreground">
          Follow topics and authors from this story to personalize your daily Otakuz workspace feed.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {followPills.map((topic) => {
            const isFollowed = !!followedTopics[topic];
            return (
              <button
                key={topic}
                type="button"
                onClick={() => toggleTopic(topic)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs uppercase tracking-wide transition ${
                  isFollowed
                    ? "border-[#27c93f]/40 bg-[#27c93f]/10 text-[#27c93f]"
                    : "border-white/10 bg-card hover:border-[#27c93f]/30 hover:bg-muted text-foreground"
                }`}
              >
                {isFollowed ? (
                  <Check className="h-3 w-3 text-[#27c93f]" />
                ) : (
                  <Plus className="h-3 w-3 text-[#27c93f]" />
                )}
                <span>{topic}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Big Comments Action Banner */}
      <div className="mt-6" id="comments">
        <button
          type="button"
          onClick={() => toast.info("Opening comments thread...")}
          className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-card py-4 font-bold uppercase tracking-wider text-foreground shadow-sm transition hover:border-[#ff5543]/40 hover:bg-muted"
        >
          <MessageSquare className="h-5 w-5 text-[#ff5543] transition-transform group-hover:scale-110" />
          <span>{commentsCount} Comments</span>
        </button>
      </div>
    </div>
  );
}
