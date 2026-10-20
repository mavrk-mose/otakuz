import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, MessageSquare, Newspaper, Plus } from "lucide-react";
import { ArticleActions } from "@/components/news/article-actions";
import { NewsArticleBody } from "@/components/news/news-article-body";
import { getNewsArticleById, fallbackNewsStories } from "@/lib/sanity";
import { getAuthorInitials, type NewsArticle, type NewsStory } from "@/types/news";

type NewsArticlePageProps = {
  params: Promise<{ id: string }>;
};

function formatPublishedDate(value?: string) {
  if (!value) return "Oct 20, 2026, 6:48 AM JST";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      timeZoneName: "short",
    }).format(new Date(value));
  } catch {
    return "Recently published";
  }
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getNewsArticleById(decodeURIComponent(id));

  if (!article) {
    return { title: "News article not found | Otakuz" };
  }

  const description = article.leadParagraph || article.summary || article.description || "Read the latest story on Otakuz.";

  return {
    title: `${article.title} | Otakuz Editorial`,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.author?.name || article.authorName || "Otakuz Staff"],
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  };
}

export default async function NewsArticlePage({ params }: NewsArticlePageProps) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const article: NewsArticle | null = await getNewsArticleById(decodedId);

  if (!article) {
    notFound();
  }

  const authorName = article.author?.name || article.authorName || "Justine Calma";
  const initials = article.author?.initials || getAuthorInitials(authorName);
  const labels = Array.from(
    new Set([article.tag, article.section, ...(article.tags || ["ANIME", "PRODUCTION", "INDUSTRY"])].filter(Boolean) as string[])
  );
  const bodyFallback = article.leadParagraph || article.description || article.summary;

  // Most popular sidebar dispatches (from fallback or related)
  const popularSidebarStories = fallbackNewsStories
    .filter((s) => s._id !== article._id)
    .slice(0, 5);

  const relatedStories = article.relatedStories?.length
    ? article.relatedStories
    : fallbackNewsStories.filter((s) => s._id !== article._id).slice(0, 3);

  return (
    <article className="-m-4 min-h-screen bg-[#121316] text-[#e3e2e6]">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="border-b border-white/5 bg-[#0d0e11]/80 px-6 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#1b1b1f] px-3 py-1.5 font-mono text-xs font-semibold text-white transition hover:bg-[#292a2d]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>ALL DISPATCHES</span>
          </Link>

          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="uppercase text-[#ff5543]">Otakuz Editorial</span>
            <span>//</span>
            <span>{article.readTime || "12 min read"}</span>
          </div>
        </div>
      </div>

      {/* ARTICLE HEADER & HERO STAGE */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-8 pt-8">
        {/* Breadcrumb / Topic Metadata Tags */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {labels.slice(0, 4).map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-wider text-[#27c93f]">
                <Plus className="h-3 w-3" />
                <span>{label}</span>
              </span>
              {index < Math.min(labels.length - 1, 3) && (
                <span className="font-mono text-xs text-white/30">•</span>
              )}
            </div>
          ))}
        </div>

        {/* Editorial Lead Headline */}
        <h1 className="mb-8 max-w-5xl text-3xl font-bold leading-[1.06] tracking-[-0.035em] text-white sm:text-4xl md:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        {/* Editorial Split: Left Media Frame, Right Drophead & Meta */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Media Hero (7 cols) */}
          <div className="flex flex-col gap-2 lg:col-span-7">
            <div className="group relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/5 bg-[#1b1b1f] shadow-2xl">
              {article.imageUrl ? (
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#1b1b1f] text-muted-foreground">
                  <Newspaper className="h-16 w-16 opacity-50" />
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0e11]/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded bg-[#0d0e11]/85 px-2.5 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ff5543]" />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-white">
                  {article.scoopBadge || "SPECIAL REPORT"}
                </span>
              </div>
            </div>

            <p className="font-mono text-[11px] tracking-wide text-muted-foreground/80">
              {article.imageCaption || "Image: Otakuz Studio Archive / Toei Animation Reference Desk"}
            </p>
          </div>

          {/* Drophead & Social Bar (5 cols) */}
          <div className="flex h-full flex-col justify-between pt-1 lg:col-span-5 lg:pl-4">
            <div>
              <p className="mb-6 text-xl font-semibold leading-[1.32] tracking-[-0.02em] text-[#e3e2e6] sm:text-2xl">
                <span className="mr-1.5 font-mono text-2xl font-light text-[#8083ff]">/</span>
                {article.leadParagraph || article.summary || article.description}
              </p>

              {/* Author Row */}
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#292a2d] font-mono text-sm font-bold text-[#ffb95f]">
                  {article.author?.imageUrl ? (
                    <Image
                      src={article.author.imageUrl}
                      alt={authorName}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">by</span>
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-white">
                      <Plus className="h-3 w-3 text-[#27c93f]" />
                      {authorName}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground/80">
                    {formatPublishedDate(article.publishedAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Utility Row */}
            <ArticleActions
              title={article.title}
              commentsCount={article.commentsCount ?? 18}
            />
          </div>
        </div>
      </section>

      {/* Sticky Article Reading Progress Pill */}
      <div className="sticky top-0 z-20 w-full border-b border-white/5 bg-[#0d0e11]/90 px-6 py-2.5 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-wider text-[#ff5543]">
              Now Reading
            </span>
            <span className="h-3 w-px bg-white/20" />
            <span className="max-w-2xl truncate text-xs font-medium text-white sm:text-sm">
              {article.title}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="#comments"
              className="flex items-center gap-1 font-mono text-muted-foreground transition hover:text-white"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#ff5543]" />
              <span>{article.commentsCount ?? 18}</span>
            </a>
          </div>
        </div>
      </div>

      {/* PRIMARY EDITORIAL & SIDEBAR CONTENT */}
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Article Column (8 cols) */}
          <main className="flex flex-col gap-8 lg:col-span-8 lg:pr-8">
            <NewsArticleBody
              content={article.content}
              fallback={bodyFallback}
              tags={labels}
              authorName={authorName}
              commentsCount={article.commentsCount ?? 18}
            />

            {/* Editorial "More in" Link Stack */}
            <div className="mt-8 border-t border-white/5 pt-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">More in:</span>
                <span className="text-sm font-bold text-[#27c93f]">
                  All the latest updates on anime production and studio pipelines
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {relatedStories.map((story) => (
                  <Link
                    key={story._id}
                    href={`/news/${encodeURIComponent(story._id)}`}
                    className="group flex flex-col gap-1.5 rounded-xl border border-white/5 bg-[#1b1b1f] p-4 transition hover:border-white/10 hover:bg-[#1f1f23]"
                  >
                    <h3 className="text-sm font-bold text-white transition group-hover:text-[#ff5543]">
                      {story.title}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                      <span className="uppercase text-[#ffb95f]">
                        {story.authorName || "Otakuz Staff"}
                      </span>
                      <span>•</span>
                      <span>{story.readTime || "5 min read"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3 text-[#ff5543]" />
                        {story.commentsCount ?? 6}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </main>

          {/* Right Rail Sidebar (4 cols) */}
          <aside className="flex flex-col gap-8 lg:col-span-4">
            {/* Most Popular Box with Vibrant Typographic Watermark */}
            <div className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1b1b1f] p-6 shadow-md">
              {/* Electric Purple Graphic Watermark */}
              <div className="pointer-events-none absolute -bottom-6 -right-3 select-none font-mono text-[84px] font-black tracking-tighter text-[#8083ff]/15 [writing-mode:vertical-rl]">
                POPULAR
              </div>

              <div className="relative z-10 mb-5 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#27c93f]">
                  MOST POPULAR
                </span>
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff5543]" />
              </div>

              <div className="relative z-10 flex flex-col gap-4">
                {popularSidebarStories.map((item, index) => {
                  const numberColor =
                    index === 0
                      ? "text-[#ff5543]"
                      : index === 1
                      ? "text-[#c0c1ff]"
                      : index === 2
                      ? "text-[#ffb95f]"
                      : "text-muted-foreground";

                  return (
                    <div key={item._id} className="flex flex-col gap-3">
                      <Link
                        href={`/news/${encodeURIComponent(item._id)}`}
                        className="group flex items-start gap-3"
                      >
                        <span className={`font-mono text-lg font-bold ${numberColor} w-4 shrink-0`}>
                          {index + 1}
                        </span>
                        <p className="text-xs font-semibold leading-snug text-white transition-colors group-hover:text-[#ff5543]">
                          {item.title}
                        </p>
                      </Link>
                      {index < popularSidebarStories.length - 1 && (
                        <div className="h-px w-full bg-white/5" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Newsletter Subscription Box ("The Otakuz Dispatch") */}
            <div className="rounded-xl border border-white/5 bg-[#1b1b1f] p-6 shadow-md">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ff5543]">
                  The Otakuz Dispatch
                </span>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  A free morning digest of the global anime, manga, and production news that matters most.
                </p>
              </div>

              <form
                className="mt-4 flex flex-col gap-2.5"
                action="#"
                method="POST"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-white/10 bg-[#0d0e11] px-3.5 py-2 font-mono text-xs text-white placeholder:text-muted-foreground/60 focus:border-[#ff5543] focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#ff5543] py-2 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#ff3b26]"
                >
                  SIGN UP
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
