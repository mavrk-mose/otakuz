import type { PortableTextBlock } from "next-sanity";
import type { SanityCardDisplay } from "./common";

/**
 * Editorial author role in the Otakuz publishing team.
 */
export type NewsAuthorRole = "admin" | "editor" | "writer" | "contributor" | "staff";

/**
 * Author profile attached to an article or news dispatch.
 */
export interface NewsAuthor {
  _id?: string;
  name: string;
  bio?: string;
  role?: NewsAuthorRole | string;
  imageUrl?: string;
  initials?: string;
  handle?: string;
}

/**
 * Embedded podcast or audio transmission associated with an editorial dispatch.
 */
export interface NewsPodcastMeta {
  isPodcast?: boolean;
  episodeTitle?: string;
  episodeNumber?: string;
  duration?: string;
  audioUrl?: string;
  summary?: string;
}

/**
 * Category or beat reference within the editorial taxonomy.
 */
export interface NewsCategory {
  _id?: string;
  title: string;
  slug?: string;
  description?: string;
}

/**
 * Canonical Verge-style scoop and report badges.
 */
export type EditorialBadge =
  | "SCOOP"
  | "SPECIAL REPORT"
  | "INVESTIGATION"
  | "EXCLUSIVE"
  | "ANALYSIS"
  | "MANGA TECH"
  | "SOUNDTRACK ENGINEERING"
  | "BOX OFFICE"
  | "INDUSTRY"
  | "PRODUCTION LEAK"
  | "HARDWARE REVIEW"
  | "COPYRIGHT LAW"
  | (string & {});

/**
 * Story card item used in lists, feeds, and hero grids.
 */
export interface NewsStory extends SanityCardDisplay {
  _id: string;
  title: string;
  slug?: { current: string } | string;
  description?: string;
  summary?: string;
  leadParagraph?: string;
  publishedAt?: string;
  commentsCount?: number;
  readsCount?: number;
  readTime?: string;
  tag?: string;
  tags?: string[];
  section?: string;
  categories?: NewsCategory[];
  imageUrl?: string;
  imageCaption?: string;
  authorName?: string;
  author?: NewsAuthor;
  isFeatured?: boolean;
  scoopBadge?: EditorialBadge;
  trendingRank?: number;
  podcast?: NewsPodcastMeta;
}

/**
 * Full detailed news article including rich PortableText body and related stories.
 */
export interface NewsArticle extends NewsStory {
  content?: PortableTextBlock[];
  relatedStories?: NewsStory[];
}

/**
 * Helper to extract initials from an author's name.
 */
export function getAuthorInitials(name?: string): string {
  if (!name) return "OZ";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * Helper to format readership counts (e.g. 89400 -> "89.4k Reads").
 */
export function formatReadsCount(reads?: number): string {
  if (!reads || reads <= 0) return "12.4k Reads";
  if (reads >= 1_000_000) {
    return `${(reads / 1_000_000).toFixed(1)}M Reads`;
  }
  if (reads >= 1_000) {
    return `${(reads / 1_000).toFixed(1)}k Reads`;
  }
  return `${reads} Reads`;
}
