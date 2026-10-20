import type { PortableTextBlock } from "next-sanity";
import type { SanityCardDisplay } from "./common";

export type NewsAuthor = {
  _id?: string;
  name: string;
  bio?: string;
  role?: string;
  imageUrl?: string;
};

export type NewsStory = SanityCardDisplay & {
  _id: string;
  title: string;
  description?: string;
  summary?: string;
  publishedAt?: string;
  commentsCount?: number;
  tag?: string;
  tags?: string[];
  imageUrl?: string;
  authorName?: string;
  author?: NewsAuthor;
};

export type NewsArticle = NewsStory & {
  content?: PortableTextBlock[];
  imageCaption?: string;
  relatedStories?: NewsStory[];
};
