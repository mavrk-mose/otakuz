import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Newspaper } from "lucide-react";
import { ArticleActions } from "@/components/news/article-actions";
import { NewsArticleBody } from "@/components/news/news-article-body";
import { getNewsArticleById } from "@/lib/sanity";
import type { NewsArticle, NewsStory } from "@/types/news";

type NewsArticlePageProps = {
  params: Promise<{ id: string }>;
};

function formatPublishedDate(value?: string) {
  if (!value) {
    return "Recently published";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function authorInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ArticlePreview({ story }: { story: NewsStory }) {
  return (
    <Link
      href={`/news/${encodeURIComponent(story._id)}`}
      className="group grid grid-cols-[6rem_1fr] gap-4 border-t py-5 first:border-t-0 first:pt-0"
    >
      <div className="relative h-20 overflow-hidden rounded-xl bg-muted">
        {story.imageUrl ? (
          <Image
            src={story.imageUrl}
            alt={story.title}
            fill
            sizes="96px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Newspaper className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-teal-600 dark:text-teal-400">
          {story.tag || story.section || "News"}
        </p>
        <h3 className="line-clamp-3 font-bold leading-snug transition group-hover:text-teal-600 dark:group-hover:text-teal-400">
          {story.title}
        </h3>
      </div>
    </Link>
  );
}

export async function generateMetadata({ params }: NewsArticlePageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getNewsArticleById(decodeURIComponent(id));

  if (!article) {
    return { title: "News article not found | Otakuz" };
  }

  const description = article.summary || article.description || "Read the latest story on Otakuz.";

  return {
    title: `${article.title} | Otakuz`,
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
  const article: NewsArticle | null = await getNewsArticleById(decodeURIComponent(id));

  if (!article) {
    notFound();
  }

  const authorName = article.author?.name || article.authorName || "Otakuz Staff";
  const labels = Array.from(
    new Set([article.section, article.tag, ...(article.tags || [])].filter(Boolean) as string[])
  );
  const bodyFallback = article.description !== article.summary ? article.description : undefined;

  return (
    <article className="-m-4 min-h-screen bg-background text-foreground">
      <section className="border-b bg-gradient-to-br from-teal-100 via-emerald-100 to-lime-100 text-slate-950 dark:from-slate-950 dark:via-teal-950 dark:to-emerald-950 dark:text-white">
        <div className="grid min-h-[calc(100vh-5rem)] lg:grid-cols-2">
          <figure className="relative min-h-[48vh] overflow-hidden border-b border-black/15 bg-slate-900 lg:min-h-[calc(100vh-5rem)] lg:border-b-0 lg:border-r dark:border-white/15">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_35%_35%,rgba(45,212,191,0.45),transparent_34%),radial-gradient(circle_at_70%_65%,rgba(163,230,53,0.35),transparent_32%)]">
                <Newspaper className="h-28 w-28 text-white/70" strokeWidth={1} />
              </div>
            )}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
            <Link
              href="/news"
              className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-black/45 md:left-8 md:top-8"
            >
              <ArrowLeft className="h-4 w-4" />
              All news
            </Link>
            {article.imageCaption ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-6 pb-5 pt-16 text-xs tracking-wide text-white/75 md:px-8">
                {article.imageCaption}
              </figcaption>
            ) : null}
          </figure>

          <div className="flex min-h-[48vh] flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-16 xl:px-16">
            {labels.length ? (
              <div className="mb-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-black uppercase tracking-[0.2em] sm:text-sm">
                {labels.map((label) => (
                  <span key={label} className="inline-flex items-center gap-2">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] leading-none">
                      +
                    </span>
                    {label}
                  </span>
                ))}
              </div>
            ) : null}

            <h1 className="border-b border-current/20 pb-7 text-[clamp(2.9rem,5.6vw,7rem)] font-black leading-[0.9] tracking-[-0.06em] [text-wrap:balance]">
              {article.title}
            </h1>

            {article.summary ? (
              <p className="border-b border-current/20 py-6 text-xl leading-tight text-current/80 sm:text-2xl lg:text-[1.75rem]">
                {article.summary}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-current/20 bg-current/10 text-sm font-black">
                {article.author?.imageUrl ? (
                  <Image
                    src={article.author.imageUrl}
                    alt={authorName}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  authorInitials(authorName)
                )}
              </div>
              <div>
                <p className="text-sm">
                  by <span className="font-black">{authorName}</span>
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-current/65">
                  <Clock3 className="h-3.5 w-3.5" />
                  <time dateTime={article.publishedAt}>{formatPublishedDate(article.publishedAt)}</time>
                </p>
              </div>
            </div>

            <div className="mt-7">
              <ArticleActions
                title={article.title}
                commentsCount={article.commentsCount || 0}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-6 py-14 sm:px-10 lg:px-12 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="max-w-3xl">
            <NewsArticleBody content={article.content} fallback={bodyFallback || article.summary} />

            {article.author?.bio ? (
              <aside className="mt-16 border-y py-8">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                  About the author
                </p>
                <h2 className="text-2xl font-black">{authorName}</h2>
                <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{article.author.bio}</p>
              </aside>
            ) : null}
          </div>

          {article.relatedStories?.length ? (
            <aside className="h-fit rounded-2xl border bg-card p-6 shadow-sm lg:sticky lg:top-8">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
                More from {article.section || "Otakuz"}
              </p>
              {article.relatedStories.map((story) => (
                <ArticlePreview key={story._id} story={story} />
              ))}
              <Link
                href="/news"
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold hover:text-teal-600 dark:hover:text-teal-400"
              >
                View all stories
                <span aria-hidden="true">→</span>
              </Link>
            </aside>
          ) : null}
        </div>
      </section>
    </article>
  );
}
