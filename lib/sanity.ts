import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-03-19',
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

export async function getEvents() {
  return client.fetch(`
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
  `);
}

export async function getProducts() {
  return client.fetch(`
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
  `);
}

export async function getArticles() {
  return client.fetch(`
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
  `);
}