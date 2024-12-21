import { createClient, defineQuery } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

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
      variants[]
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