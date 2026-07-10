import { createClient, defineQuery } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { NewsArticle, NewsStory } from '@/types/news';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-12-05',
  useCdn: false, // set to `false` to bypass the edge cache
  // token: process.env.SANITY_SECRET_TOKEN // Needed for certain operations like updating content or accessing previewDrafts perspective
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getEvents() {
  return client.fetch(defineQuery(`
    *[_type == "event"] | order(date desc) {
      _id,
      title,
      date,
      time,
      location,
      thumbnailUrl,
      attendees[],
      organizers[]->{
        _id,
        name,
        avatar
      }
    }
  `));
}

export const newsStoriesQuery = defineQuery(`
  *[_type == "event" && defined(section)] | order(publishedAt desc) {
    _id,
    title,
    description,
    summary,
    "authorName": coalesce(author->name, "Staff"),
    publishedAt,
    commentsCount,
    tag,
    tags,
    section,
    panelClassName,
    textClassName,
    itemClassName,
    isFeatured,
    "imageUrl": thumbnailUrl.asset->url
  }
`);

export const newsArticleByIdQuery = defineQuery(`
  *[_type == "event" && defined(section) && _id == $id][0] {
    _id,
    title,
    description,
    summary,
    content,
    imageCaption,
    publishedAt,
    commentsCount,
    tag,
    tags,
    section,
    isFeatured,
    "imageUrl": thumbnailUrl.asset->url,
    "authorName": coalesce(author->name, "Staff"),
    author->{
      _id,
      name,
      bio,
      role,
      "imageUrl": image.asset->url
    },
    "relatedStories": *[
      _type == "event" &&
      defined(section) &&
      _id != ^._id &&
      section == ^.section
    ] | order(publishedAt desc)[0...3] {
      _id,
      title,
      summary,
      description,
      publishedAt,
      tag,
      section,
      commentsCount,
      "imageUrl": thumbnailUrl.asset->url,
      "authorName": coalesce(author->name, "Staff")
    }
  }
`);

export async function getNewsStories(): Promise<NewsStory[]> {
  return client.fetch<NewsStory[]>(newsStoriesQuery);
}

export async function getNewsArticleById(id: string): Promise<NewsArticle | null> {
  return client.fetch<NewsArticle | null>(newsArticleByIdQuery, { id });
}

export async function getProducts() {
  return client.fetch(defineQuery(`
    *[_type == "product"] | order(_createdAt desc) {
      _id,
      name,
      description,
      price,
      image[],
      category,
      rating,
      stock,
      variants[],
      "title": title -> {
        _id,
        name,
        image,
      }
    }
  `));
}

export async function getArticles() {
  return client.fetch(defineQuery(`
    *[_type == "article"] | order(_createdAt desc) {
      _id,
      title,
      content,
      "image": mainImage.asset->url,
      "author": author->{
        name,
        "image": image.asset->url
      },
      categories[]->{
        title
      },
      publishedAt,
      polls[]{
        question,
        options[]{
          text,
          votes
        }
      }
    }
  `));
}

export async function registerForEvent(eventId: string, userId: string, userName: string, userPhotoUrl: string) {
  return client.patch(eventId)
    .setIfMissing({ attendees: [] })
    .append('attendees', [{ 
      userId, 
      name: userName, 
      photoUrl: userPhotoUrl 
    }])
    .inc({ attendeeCount: 1 })
    .commit();
}


// TODO: paginating through the data with groq when documents reach > 10k
// https://www.sanity.io/docs/paginating-with-groq
// let lastId = ''
//
// async function fetchNextPage() {
//   if (lastId === null) {
//     return []
//   }
//   const {result} = await fetch(
//       groq`*[_type == "article" && _id > $lastId] | order(_id) [0...100] {
//       _id, title, body
//     }`, {lastId})
//
//   if (result.length > 0) {
//     lastId = result[result.length - 1]._id
//   } else {
//     lastId = null // Reached the end
//   }
//   return result
// }

// TODO: filtering using publishedAt & paginating through the content
// let lastPublishedAt = ''
// let lastId = ''
//
// async function fetchNextPage() {
//   if (lastId === null) {
//     return []
//   }
//
//   const {result} = await fetch(
//       groq`*[_type == "article" && (
//       publishedAt > $lastPublishedAt
//       || (publishedAt == $lastPublishedAt && _id > $lastId)
//     )] | order(publishedAt) [0...100] {
//       _id, title, body, publishedAt
//     }`, {lastPublishedAt, lastId})
//
//   if (result.length > 0) {
//     lastPublishedAt = result[result.length - 1].publishedAt
//     lastId = result[result.length - 1]._id
//   } else {
//     lastId = null  // Reached the end
//   }
//   return result
// }
