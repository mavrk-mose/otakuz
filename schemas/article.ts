export default {
  name: 'article',
  title: 'Articles',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'leadParagraph',
      title: 'Lead Paragraph / Drophead',
      type: 'text',
      rows: 3,
      description: 'The prominent editorial drophead displayed next to the hero image or below the title.',
    },
    {
      name: 'scoopBadge',
      title: 'Scoop / Editorial Badge',
      type: 'string',
      description: "e.g. '9.4 // SCOOP', 'SPECIAL REPORT', 'INVESTIGATION', 'EXCLUSIVE', 'ANALYSIS'",
    },
    {
      name: 'isFeatured',
      title: 'Featured Lead Story',
      type: 'boolean',
      description: 'Feature this story as the top editorial lead on the news frontpage',
      initialValue: false,
    },
    {
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
    },
    {
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'imageCaption',
      title: 'Main Image Caption / Credit',
      type: 'string',
      description: "e.g. 'Image: Otakuz Studio Archive / Toei Animation Reference Desk'",
    },
    {
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [{ type: 'reference', to: { type: 'category' } }],
    },
    {
      name: 'readTime',
      title: 'Estimated Read Time',
      type: 'string',
      placeholder: '12-min read',
    },
    {
      name: 'readsCount',
      title: 'Reads Count',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'commentsCount',
      title: 'Comments Count',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'trendingRank',
      title: 'Trending Leaderboard Rank (1-5)',
      type: 'number',
      description: 'Optional ranking for Most Popular Dispatches (1-5)',
    },
    {
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    },
    {
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          fields: [
            {
              type: 'text',
              name: 'alt',
              title: 'Alternative text',
            },
            {
              type: 'string',
              name: 'caption',
              title: 'Caption / Credit',
            },
          ],
        },
      ],
    },
    {
      name: 'podcast',
      title: 'Podcast / Audio Feature',
      type: 'object',
      fields: [
        { name: 'isPodcast', title: 'Is Podcast Feature', type: 'boolean', initialValue: false },
        { name: 'episodeTitle', title: 'Episode Title', type: 'string' },
        { name: 'episodeNumber', title: 'Episode Number (e.g. EP 114)', type: 'string' },
        { name: 'duration', title: 'Runtime Duration (e.g. 54 min runtime)', type: 'string' },
        { name: 'audioUrl', title: 'Audio URL', type: 'url' },
        { name: 'summary', title: 'Podcast Summary', type: 'text' },
      ],
    },
    {
      name: 'polls',
      title: 'Polls',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'question',
              title: 'Question',
              type: 'string',
            },
            {
              name: 'options',
              title: 'Options',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'text', type: 'string' },
                    { name: 'votes', type: 'number', initialValue: 0 },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
