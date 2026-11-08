import { fallbackNewsStories } from "./fallback-stories";
export { fallbackNewsStories } from "./fallback-stories";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import { toSanityPage, type SanityCursor } from "@/lib/sanity-pagination";
import type { NewsArticle, NewsStory } from "@/types/news";
import { defineQuery } from "next-sanity";

export default function useFetchNewsStories(category = "All Stories") {
  const query = useInfiniteQuery({
    queryKey: ["newsStoryPages", category], initialPageParam: null as SanityCursor | null,
    queryFn: ({ pageParam, signal }) => getNewsPage(category, pageParam, 24, signal), getNextPageParam: page => page.nextCursor ?? undefined,
  });
  const highlights = useQuery({ queryKey: ["newsHighlights", category], queryFn: ({ signal }) => getNewsHighlights(category, signal) });
  return { ...query, stories: query.data?.pages.flatMap(page => page.items), highlights: highlights.data, isLoading: query.isPending || highlights.isPending };
}

export const newsCardFields = `
    _id,
    title,
    slug,
    "description": coalesce(summary, leadParagraph, array::join(string::split(pt::text(content), " ")[0...60], " "), ""),
    leadParagraph,
    summary,
    publishedAt,
    "tag": coalesce(tag, categories[0]->title, "Industry"),
    "tags": categories[]->title,
    "section": coalesce(section, tag, categories[0]->title, "Industry"),
    categories[]->{
      _id,
      title
    },
    "imageUrl": mainImage.asset->url,
    imageCaption,
    "authorName": coalesce(author->name, "Staff"),
    author->{
      _id,
      name,
      role,
      "imageUrl": image.asset->url
    },
    isFeatured,
    scoopBadge,
    readTime,
    readsCount,
    commentsCount,
    trendingRank,
    podcast
  `;
const all = `_type == "article" && !(_id in path("drafts.**"))`;
const categoryFilter = `${all} && ($category == "All Stories" || lower(section) == lower($category) || lower(tag) == lower($category) || lower(coalesce(section, tag, categories[0]->title, "Industry")) == $categoryLower || count((categories[]->title)[lower(@) == $categoryLower]) > 0 || count(tags[lower(@) == $categoryLower]) > 0)`;
const date = `coalesce(publishedAt, _createdAt, "")`;
const latest = `order(${date} desc, _id asc)`;
export function buildNewsPageQuery(category = "All Stories", cursor: SanityCursor | null = null, limit = 24) {
  limit = Math.min(100, Math.max(1, Math.floor(limit) || 24));
  return { query: `{
    "items": *[${categoryFilter} && ($cursorId == null || ${date} < $cursorValue || (${date} == $cursorValue && _id > $cursorId))] | ${latest}[0...$fetchLimit]{${newsCardFields}, "_sort": ${date}},
    "total": count(*[${categoryFilter}])
  }`, params: { category, categoryLower: category.toLowerCase(), cursorId: cursor?.id ?? null, cursorValue: cursor?.value ?? null, fetchLimit: limit + 1 }, limit };
}
const investigations = `${all} && (tag match "*investigation*" || scoopBadge match "*special report*" || scoopBadge match "*leak*" || scoopBadge match "*review*" || _id match "anomaly*")`;
export const newsHighlightsQuery = `{
  "lead": *[${categoryFilter}] | order(isFeatured desc, ${date} desc, _id asc)[0...4]{${newsCardFields}},
  "trending": select(count(*[${all} && defined(trendingRank)]) >= 3 => *[${all} && defined(trendingRank)] | order(trendingRank asc, _id asc)[0...5]{${newsCardFields}}, *[${all}] | ${latest}[2...7]{${newsCardFields}}),
  "podcast": coalesce(*[${all} && podcast.isPodcast == true] | ${latest}[0]{${newsCardFields}}, *[${all}] | ${latest}[0]{${newsCardFields}}),
  "anomalies": select(count(*[${investigations}]) > 0 => *[${investigations}] | ${latest}[0...4]{${newsCardFields}}, *[${all}] | ${latest}[1...5]{${newsCardFields}})
}`;
export const newsArticleByIdQuery = defineQuery(`
  *[_type == "article" && (_id == $id || slug.current == $id)][0] {
    _id,
    title,
    slug,
    "description": pt::text(content),
    leadParagraph,
    summary,
    content,
    polls,
    publishedAt,
    "tag": coalesce(categories[0]->title, "Industry"),
    "tags": categories[]->title,
    "section": coalesce(categories[0]->title, "Industry"),
    categories[]->{
      _id,
      title
    },
    "imageUrl": mainImage.asset->url,
    imageCaption,
    "authorName": coalesce(author->name, "Staff"),
    author->{
      _id,
      name,
      bio,
      role,
      "imageUrl": image.asset->url
    },
    isFeatured,
    scoopBadge,
    readTime,
    readsCount,
    commentsCount,
    trendingRank,
    podcast,
    "relatedStories": *[
      _type == "article" &&
      _id != ^._id &&
      references(^.categories[]._ref)
    ] | order(publishedAt desc)[0...4] {
      _id,
      title,
      slug,
      "description": pt::text(content),
      leadParagraph,
      summary,
      publishedAt,
      "tag": coalesce(categories[0]->title, "Industry"),
      "tags": categories[]->title,
      "section": coalesce(categories[0]->title, "Industry"),
      "imageUrl": mainImage.asset->url,
      imageCaption,
      "authorName": coalesce(author->name, "Staff"),
      commentsCount,
      readTime
    }
  }
`);

export type NewsHighlights = { lead: NewsStory[]; trending: NewsStory[]; podcast: NewsStory | null; anomalies: NewsStory[] };
function fallbackStories(category: string) {
  return fallbackNewsStories.filter(story => category === "All Stories" || [story.section, story.tag, ...(story.tags ?? [])].some(value => value?.toLowerCase() === category.toLowerCase()));
}
export async function getNewsPage(category = "All Stories", cursor: SanityCursor | null = null, limit = 24, signal?: AbortSignal) {
  const request = buildNewsPageQuery(category, cursor, limit);
  try {
    const response = await client.fetch<{ items: (NewsStory & { _sort: string })[]; total: number }>(request.query, request.params, { signal });
    if (response.total || cursor || category !== "All Stories") return toSanityPage(response, request.limit);
  } catch (error) { if (cursor || signal?.aborted) throw error; }
  // Local editorial fixtures are only used when the remote catalogue is absent/unavailable.
  const rows = fallbackStories(category).slice(0, request.limit);
  return { items: rows, total: rows.length, nextCursor: null };
}
export async function getNewsStories() { return (await getNewsPage()).items; }
export async function getNewsHighlights(category = "All Stories", signal?: AbortSignal): Promise<NewsHighlights> {
  try {
    const highlights = await client.fetch<NewsHighlights>(newsHighlightsQuery, { category, categoryLower: category.toLowerCase() }, { signal });
    if (highlights.lead.length || category !== "All Stories") return highlights;
  } catch (error) { if (signal?.aborted) throw error; }
  const lead = fallbackStories(category);
  return { lead: lead.slice(0, 4), trending: fallbackNewsStories.slice(2, 7), podcast: fallbackNewsStories.find(story => story.podcast?.isPodcast) ?? null, anomalies: fallbackNewsStories.slice(1, 5) };
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  try {
    const article = await client.fetch<NewsArticle | null>(newsArticleByIdQuery, { id });
    if (article) {
      return article;
    }
  } catch (error) {
    console.warn('[Sanity] client.fetch error for newsArticleByIdQuery, using editorial fallback:', error);
  }

  // Check fallback mock stories by _id or slug
  const matched = fallbackNewsStories.find(
    (story) => story._id === id || (typeof story.slug === 'object' && story.slug?.current === id) || story.slug === id
  );

  if (matched) {
    const relatedStories = fallbackNewsStories
      .filter((s) => s._id !== matched._id)
      .slice(0, 4);

    return {
      ...matched,
      relatedStories,
    };
  }

  // Default to the featured story if unknown id in local/fallback mode
  const fallbackLead = fallbackNewsStories[1] || fallbackNewsStories[0];
  return {
    ...fallbackLead,
    _id: id,
    relatedStories: fallbackNewsStories.filter((s) => s._id !== fallbackLead._id).slice(0, 4),
  };
}
