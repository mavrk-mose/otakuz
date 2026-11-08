import type { SanityCursor } from "./sanity-queries";
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
