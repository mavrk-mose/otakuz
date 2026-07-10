import type { PortableTextBlock } from "next-sanity";

export type NewsAuthor = {
  _id?: string;
  name: string;
  bio?: string;
  role?: string;
  imageUrl?: string;
};

export type NewsStory = {
  _id: string;
  title: string;
  description?: string;
  summary?: string;
  publishedAt?: string;
  commentsCount?: number;
  tag?: string;
  tags?: string[];
  section?: string;
  panelClassName?: string;
  textClassName?: string;
  itemClassName?: string;
  isFeatured?: boolean;
  imageUrl?: string;
  authorName?: string;
  author?: NewsAuthor;
};

export type NewsArticle = NewsStory & {
  content?: PortableTextBlock[];
  imageCaption?: string;
  relatedStories?: NewsStory[];
};
