import { createClient, defineQuery } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { NewsArticle, NewsStory } from '@/types/news';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-12-05',
  useCdn: false, // set to `false` to bypass the edge cache
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

export const fallbackNewsStories: NewsStory[] = [
  {
    _id: 'editorial-lead-1',
    title: 'The 16mm Cel Comeback: How Kyoto Studio Veterans Are Reclaiming Film Grain Over GPU Renders',
    slug: { current: '16mm-cel-comeback-kyoto-animation' },
    leadParagraph:
      'With commercial TV schedules collapsing under relentless 3D asset churning, key animators behind recent box office triumphs reveal their clandestine migration to photochemical cameras and manual multiplane setups.',
    summary:
      'With commercial TV schedules collapsing under relentless 3D asset churning, key animators behind recent box office triumphs reveal their clandestine migration to photochemical cameras and manual multiplane setups.',
    description:
      'Senior Tokyo directors are reviving analog multiplane camera rigs to escape hyper-clean digital rendering pipelines and recapture physical grain.',
    authorName: 'Shinji Takahashi',
    author: {
      name: 'Shinji Takahashi',
      role: 'Production Desk Lead',
      bio: 'Veteran anime industry investigator and former layout assistant based in Kyoto.',
      initials: 'ST',
    },
    publishedAt: '2026-10-20T05:42:00Z',
    tag: 'Investigation',
    tags: ['Investigation', 'Anime', 'Production', 'Kyoto'],
    section: 'Production Desk',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_KqWQMCrNVv9tvcGDEEezI_kUPgAM0oiUQt7ooOPAmKnmVY1Pkp9vP3KRxqeAXH0n86lN6jyCh5zyD-KHry71u2a3qdVBblQz6wZZCpxJjy8VOSvD7K76CgsiEN0Ev0vS1v8G7PWFs35we3TyV7iCf7I833twg5L4NFQYS21OuxWmtPJaSaDkcoA1-i5oRergoW2hG10uberzhDCzP49z2GQxOUF_Q-CbQSU6LrJO0AgnVt3sjyWxdg',
    imageCaption: 'Image: Otakuz Studio Archive / Toei Animation Reference Desk',
    scoopBadge: '9.4 // SCOOP',
    isFeatured: true,
    readTime: '8 min read',
    readsCount: 94200,
    commentsCount: 42,
  },
  {
    _id: 'editorial-lead-2',
    title: 'The 2D animation comeback is here: studios push back against the synthetic pipeline',
    slug: { current: 'the-2d-animation-comeback-is-here' },
    leadParagraph:
      'Animation studios are demanding human craft, and Japanese production committees are making sure classic hand-drawn techniques meet the global streaming moment.',
    summary:
      'The Tokyo animation industry is constructing more dedicated pencil-and-paper drafting benches than it has in nearly two decades, even as pressures from foreign streaming consortiums mount.',
    description:
      'A sweeping new JAniCA audit confirms hand-rendered character keys drove 35% higher international licensing value in late 2025 compared to automated interpolation models.',
    authorName: 'Justine Calma',
    author: {
      name: 'Justine Calma',
      role: 'Senior Features Editor',
      bio: 'Reporting on Japanese creative industries, studio labor movements, and visual culture.',
      initials: 'JC',
    },
    publishedAt: '2026-10-20T06:48:00Z',
    tag: 'Industry',
    tags: ['Anime', 'Production', 'Industry'],
    section: 'Industry',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCwB1-JGz6HYgSuiB5uadHZ5NvF8Qq9QTUWzotHYcsZBmMkAwm5Col__Rhf1BTEZEbYKzZPAIC8FBdXciVqRGMcla6rm053eYcyw00Tgg82eYcjCnLlEJhRhAExkEBdW03gSVAAo8VrR35O-9E8XeyknQC53clpJpzCLvbXsqmtA1cU552Tdv0WyRT11ktf9omsUl-Zn4l_Q8Jut80j1MPTg8EBl8JBuOoQjCMx7hJUMvhJdGzFjeLeKw',
    imageCaption: 'Image: Otakuz Studio Archive / Toei Animation Reference Desk',
    scoopBadge: 'SPECIAL REPORT',
    readTime: '12 min read',
    readsCount: 112000,
    commentsCount: 18,
  },
  {
    _id: 'editorial-sub-1',
    title: 'Shueisha introduces simultaneous 14-language raw chapter decoders using local on-device neural models',
    slug: { current: 'shueisha-14-language-raw-decoders' },
    leadParagraph: 'Manga creators gain unprecedented real-time localization tools built directly into clip studio workstation pipelines.',
    summary: 'Manga creators gain unprecedented real-time localization tools built directly into clip studio workstation pipelines.',
    authorName: 'Aoi Murakami',
    author: { name: 'Aoi Murakami', role: 'Manga Technology Writer', initials: 'AM' },
    publishedAt: '2026-10-20T08:15:00Z',
    tag: 'Manga Tech',
    tags: ['Manga', 'Tech', 'Shueisha'],
    section: 'Manga House',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBSQ_6Fe28JxZcQja9fXDTAehlqpRA6T0r2bnPfy63wu5253ZyBswNdPs8uwtqRnqUn9LCtWRElXsX-txO6MawW8GWUJmn7KjnwiHWv-o8pJ_XWUVSBz8hcDB4WRn5GizF_nVeRJONNOuQS-8EM7cMXQoyqZ23xDwx6-YawJN3lZ7ADLDU8iWu870SZGj4BLTFipmB1eKDvrSINdFwhmgFPC727i_3D1XLJZPM7MHvdN7ejMgZc8Cg2yg',
    scoopBadge: 'MANGA TECH',
    readTime: '4 min read',
    readsCount: 54100,
    commentsCount: 19,
  },
  {
    _id: 'editorial-sub-2',
    title: 'Kensuke Ushio’s modular synth rig: Inside the sonic architectural madness of Chainsaw Man Season 2',
    slug: { current: 'kensuke-ushio-modular-synth-chainsaw-man' },
    leadParagraph: 'Inside the patched cables, custom Eurorack filters, and analog tape loops shaping the haunting soundscapes of Denji’s newest chapter.',
    summary: 'Inside the patched cables, custom Eurorack filters, and analog tape loops shaping the haunting soundscapes of Denji’s newest chapter.',
    authorName: 'Kenji Vance',
    author: { name: 'Kenji Vance', role: 'Soundtrack Critic', initials: 'KV' },
    publishedAt: '2026-10-20T07:30:00Z',
    tag: 'Soundtrack Engineering',
    tags: ['Soundtrack', 'Chainsaw Man', 'MAPPA'],
    section: 'Production Desk',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkSHJ_2fHdl_p6hmkbPLfeqbTgk6ShbmFNutQ8iV3goOAQLzLczG5IuDDD1vrUx68X3J-tZnNebJjZuBeYo9roJratk6HmN4RYtDxTFfTAWVmkaoGJhx6V6t4cD0HHgCXts5tQA8lUcNHCXsOKEt7GQWZeWhyGU5ogziuCLN6GEvAFchanNNBLLxCnshinunbOXAQV7WuzJWygP0_Kfmb1Y3pj2SCJk5x9lY34kBqk9khHNj2VhWbv4Q',
    scoopBadge: 'SOUNDTRACK ENGINEERING',
    readTime: '6 min read',
    readsCount: 42800,
    commentsCount: 37,
  },
  {
    _id: 'editorial-sub-3',
    title: 'Toho announces IMAX remaster run for vintage Satoshi Kon classics with original magnetic tape audio',
    slug: { current: 'toho-satoshi-kon-imax-remaster' },
    leadParagraph: 'Millennium Actress and Perfect Blue receive pristine uncompressed 4K transfers overseen by Madhouse founding archivists.',
    summary: 'Millennium Actress and Perfect Blue receive pristine uncompressed 4K transfers overseen by Madhouse founding archivists.',
    authorName: 'Rei Asuka',
    author: { name: 'Rei Asuka', role: 'Cinema Columnist', initials: 'RA' },
    publishedAt: '2026-10-20T06:00:00Z',
    tag: 'Box Office Dispatches',
    tags: ['IMAX', 'Satoshi Kon', 'Cinema'],
    section: 'Box Office',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBhA8_w-eLk6e6bnqXtLpPxC1gRk8WU_sL4X1sLO8sTv6bf8G20Baa0lSNaBMKzW9y2UjjO-07EWCByf5mSve_jyi_UPbhGRHU1jNQIkQAajHNDd3iyQdLlElAjY7ps7Gafn-ofITzFMQCKU9bIJMAafigmXgOQPCFlnvuLtY6l7L9i6Lc-KJcjAz-9kIpmRNTnFvCVllF1pMdPS6yOsYhrOnu3O71J3j6raLMnoeXuWAF4uIb-AlSPrQ',
    scoopBadge: 'BOX OFFICE',
    readTime: '5 min read',
    readsCount: 38200,
    commentsCount: 28,
  },
  {
    _id: 'trending-1',
    title: 'Studio MAPPA confirms the Chainsaw Man Reze Arc theatrical run will get worldwide 70mm prints',
    slug: { current: 'chainsaw-man-reze-arc-70mm' },
    authorName: 'Daiki Sone',
    author: { name: 'Daiki Sone', role: 'Staff Writer' },
    publishedAt: '2026-10-20T04:20:00Z',
    tag: 'Simulcast',
    section: 'Simulcast',
    readsCount: 89400,
    commentsCount: 128,
    trendingRank: 1,
  },
  {
    _id: 'trending-2',
    title: 'Dandadan Season 2 production schedule greenlit for consecutive split-cours through 2026',
    slug: { current: 'dandadan-season-2-greenlit' },
    authorName: 'Eri Kurosawa',
    author: { name: 'Eri Kurosawa', role: 'Staff Writer' },
    publishedAt: '2026-10-20T03:10:00Z',
    tag: 'Production Desk',
    section: 'Production Desk',
    readsCount: 64200,
    commentsCount: 73,
    trendingRank: 2,
  },
  {
    _id: 'trending-3',
    title: 'Voice actors union and major anime producers ink historic pact on unconsented vocal synthesis',
    slug: { current: 'seiyuu-union-voice-synthesis-pact' },
    authorName: 'Yuki Tanaka',
    author: { name: 'Yuki Tanaka', role: 'Legal Correspondent' },
    publishedAt: '2026-10-20T02:00:00Z',
    tag: 'Industry',
    section: 'Industry',
    readsCount: 51100,
    commentsCount: 204,
    trendingRank: 3,
  },
  {
    _id: 'trending-4',
    title: 'A community archival collective unearths the lost 1986 Bubblegum Crisis original master reels',
    slug: { current: 'bubblegum-crisis-master-reels-found' },
    authorName: 'Arthur Pendelton',
    author: { name: 'Arthur Pendelton', role: 'Archivist' },
    publishedAt: '2026-10-20T01:30:00Z',
    tag: 'Industry',
    section: 'Industry',
    readsCount: 48900,
    commentsCount: 52,
    trendingRank: 4,
  },
  {
    _id: 'trending-5',
    title: 'Bocchi the Rock creator teases new project centered on Tokyo underground modular synthesizers',
    slug: { current: 'bocchi-creator-underground-modular-project' },
    authorName: 'Kanna Shimizu',
    author: { name: 'Kanna Shimizu', role: 'Culture Writer' },
    publishedAt: '2026-10-20T00:50:00Z',
    tag: 'Interviews',
    section: 'Interviews',
    readsCount: 39700,
    commentsCount: 31,
    trendingRank: 5,
  },
  {
    _id: 'podcast-1',
    title: 'Why Japanese Production Committees Are Finally Opening Direct Stakes to International Fans',
    slug: { current: 'otakucast-ep114-production-committees' },
    summary:
      'We sit down with former Aniplex executives to dissect how crowdfunding equity and global presales are fundamentally threatening the traditional TV broadcasting monopoly.',
    authorName: 'OtakuCast Studio',
    publishedAt: '2026-10-19T21:00:00Z',
    tag: 'Interviews',
    section: 'Interviews',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDivb4oWwvfShO3Zvpc8W3QmxgXf8nLZJaX0IjFbAdIZzVpDRMFFSyn2-AXUPEJnf5iF1I_m4RAscVwGM9niL_SGCVhE5VLYkgalAT8hZxMtvcal7J9tzksY7CvPplMHVLAlt_tfryToMRljuawsAA0cFY1LfAY2AgLptA7fHAe2uXTjDmFZzKX51-DE_UMlX2ehFioYwXpJajBypOXsNqMJaHgBmnB8rEL8E9KiKXDKOHcOdYESKUuOw',
    podcast: {
      isPodcast: true,
      episodeTitle: 'Why Japanese Production Committees Are Opening Stakes',
      episodeNumber: 'EP 114',
      duration: '54 min runtime',
    },
    commentsCount: 16,
  },
  {
    _id: 'anomaly-1',
    title: "Don't Let Machine Voice Banks Clone Your Favorite Seiyuu Without A Contract",
    slug: { current: 'seiyuu-voice-cloning-dossier' },
    leadParagraph:
      'Unregulated gaming studios are increasingly deploying generative vocal kits calibrated on decades of radio drama CD rips, triggering walkouts across Tokyo talent management agencies.',
    summary:
      'Unregulated gaming studios are increasingly deploying generative vocal kits calibrated on decades of radio drama CD rips, triggering walkouts across Tokyo talent management agencies.',
    authorName: 'Makoto Shinkawa',
    author: { name: 'Makoto Shinkawa', role: 'Investigative Bureau', initials: 'MS' },
    publishedAt: '2026-10-19T18:00:00Z',
    tag: 'Investigation',
    section: 'Industry',
    scoopBadge: 'SPECIAL REPORT',
    readTime: '12-min Dossier',
    readsCount: 78000,
    commentsCount: 89,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAtke_gN4GS1KDoZKYRHGvbr69W3ljjGSXA6FXlz4Yqcr2Ewk3yHXaY91Ykn5sJlX9H6m1hfYzQVzA3nJAc-wbGzMMjejuW-wOhDuyXnlzuwt_-qOaUv6mMRpgOX3dBg7qLfPHsaa-qprzJSH1W4gm3TvtKYFiKxa-enXoskKCrB1d7efYDI9W5pJBy2257tZzWxjx8OE3hX-R7FVYB_fzrwdqO9I9XPfXfhI_5pLc3paSc560SXtdDSw',
  },
  {
    _id: 'anomaly-sub-1',
    title: 'Leaked budget ledgers reveal top anime movies spend less than 12% on original soundtrack arrangements',
    slug: { current: 'leaked-budget-ledgers-anime-soundtracks' },
    authorName: 'Hina Tachibana',
    publishedAt: '2026-10-19T16:20:00Z',
    tag: 'Production Leak',
    section: 'Production Desk',
    scoopBadge: 'PRODUCTION LEAK',
    commentsCount: 24,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSEKQw8PfWoByc7PblvgJYObQ2u8topbujtyCO-7YwTuwXADOtVuS5Lc1sQBksluEKPVLfsZf9f1w0RAF-x7khrkmfjGtRoEOlyr4ht3P_8Bfs7f169wHKwpY-ij5hTZQSbKNVD2303wD3c0ts8KXbw1CAL4lLWnQM0yBJusiOG-CL-s9aSI-GbdY20DbPtJzy_De-_xi4Xjcv_lO3_JStSsiI0nOFFPLet5KQlt7CE1sUe0TQDmR0wA',
  },
  {
    _id: 'anomaly-sub-2',
    title: 'We tested the $1,200 Wacom alternative favored by Kyoto Animation background painters',
    slug: { current: 'tested-wacom-alternative-kyoto-animation' },
    authorName: 'Goro Miyazaki',
    publishedAt: '2026-10-19T14:10:00Z',
    tag: 'Hardware Review',
    section: 'Production Desk',
    scoopBadge: 'HARDWARE REVIEW',
    commentsCount: 61,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDMAANEqD3oP9i9zR9UJu48GnNrPuwbIBPyG3DrV5FX_ZHJlwMEjFvg-PqJNTA1GDfks64i77vWdNGoz44oOzCebKHr0af5LdxV6x3Z4hM3EgeSTHCR7RmsysEjqvk-4CCg_qzSuQTSDpNPXvs2J-Cne5r6II8Dmp8DrpPTH35wzlu2GOSmesrl_ZZ36UtuHmGmcN5jX2DuMhopFWrae87uzP0HYsHFPPt_-jQdOMhKDIRpVFVDx8vc6Q',
  },
  {
    _id: 'anomaly-sub-3',
    title: 'The Comiket Doujin Fair introduces blockchain fingerprinting to protect fan artists from commercial scrape farms',
    slug: { current: 'comiket-blockchain-fingerprinting' },
    authorName: 'Ren Oosawa',
    publishedAt: '2026-10-19T11:45:00Z',
    tag: 'Copyright Law',
    section: 'Industry',
    scoopBadge: 'COPYRIGHT LAW',
    commentsCount: 112,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuACfvIDti1Z-0Oo6AM7VFFv_Vf6o-0tlyBDQlBeKF7ZqXuHl1I7t2VapZwnqbUkGgWNp0wrbd-HaW8CXt4T6hvcqMXEnIFATyY0K6cwY2Qx9IXJu-qPV7mN929oLLy7FdgyrD8twWwscbLL8E7qG3qLzmmIg9zDYVcDGBMrG1deTZTwXpnBuF4FsMOE923xTTOKO9RpCk4hjbd53xEsOGK3ofdE_I5T9cds2WQUrNvXtjqW0G1c3Wap1Q',
  },
];

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
  *[_type == "article"] | order(publishedAt desc) {
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
    podcast
  }
`);

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

export async function getNewsStories(): Promise<NewsStory[]> {
  try {
    const stories = await client.fetch<NewsStory[]>(newsStoriesQuery);
    if (stories && stories.length > 0) {
      return stories;
    }
  } catch (error) {
    console.warn('[Sanity] client.fetch error for newsStoriesQuery, using editorial fallback:', error);
  }
  return fallbackNewsStories;
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
      photoUrl: userPhotoUrl, 
      registeredAt: new Date().toISOString() 
    }])
    .commit();
}
