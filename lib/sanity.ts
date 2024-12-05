import { createClient, defineQuery } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-12-05',
  useCdn: true, // set to `false` to bypass the edge cache
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
      description,
      date,
      time,
      location,
      thumbnailUrl,
      category,
      tags,
      "createdBy": author->{
        _id,
        name
      },
      attendees[]
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
      "image": image[].asset->url,
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