export default {
    name: 'product',
    title: 'Products',
    type: 'document',
    fields: [
      {
        name: 'name',
        title: 'Name',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
      },
      {
        name: 'price',
        title: 'Price',
        type: 'number',
        validation: (Rule: any) => Rule.required().positive(),
      },
      {
        name: 'image',
        title: 'Image',
        type: 'array',
        of: [{ type: 'image' }],
        options: {
          hotspot: true,
        },
      },
      {
        name: 'category',
        title: 'Category',
        type: 'string',
        options: {
          list: [
            { title: 'Clothing', value: 'clothing' },
            { title: 'Figures', value: 'figures' },
            { title: 'Accessories', value: 'accessories' },
            { title: 'Manga', value: 'manga' },
            { title: 'Home & Decor', value: 'home' },
            { title: 'Collectibles', value: 'collectibles' },
          ],
        },
      },
      {
        name: 'rating',
        title: 'Rating',
        type: 'number',
        validation: (Rule: any) => Rule.min(0).max(5),
      },
      {
        name: 'stock',
        title: 'Stock',
        type: 'number',
        validation: (Rule: any) => Rule.required().min(0),
      },
      {
        name: 'variants',
        title: 'Variants',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'name', type: 'string' },
              { name: 'price', type: 'number' },
              { name: 'stock', type: 'number' },
            ],
          },
        ],
      },
      {
        name: 'title',
        title: 'Title',
        type: 'reference',
        to: { type: 'title' },
      },
    ],
  };