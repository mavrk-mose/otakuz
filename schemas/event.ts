const eventSchema = {
    name: 'event',
    title: 'Events',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: (Rule: any) => Rule.required(),
      },
      {
        name: 'summary',
        title: 'Summary',
        type: 'text',
      },
      {
        name: 'description',
        title: 'Description',
        type: 'text',
      },
      {
        name: 'content',
        title: 'Article Content',
        description: 'Rich article body used on the news detail page.',
        type: 'array',
        of: [
          { type: 'block' },
          {
            type: 'image',
            options: { hotspot: true },
            fields: [
              {
                name: 'alt',
                title: 'Alternative Text',
                type: 'string',
              },
              {
                name: 'caption',
                title: 'Caption',
                type: 'string',
              },
            ],
          },
        ],
      },
      {
        name: 'date',
        title: 'Date',
        type: 'date',
      },
      {
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
      },
      {
        name: 'time',
        title: 'Time',
        type: 'string',
      },
      {
        name: 'location',
        title: 'Location',
        type: 'object',
        fields: [
          { name: 'name', type: 'string', title: 'Venue Name' },
          { name: 'address', type: 'string', title: 'Address' },
          {
            name: 'coordinates',
            type: 'geopoint',
            title: 'Coordinates',
          },
        ],
      },
      {
        name: 'thumbnailUrl',
        title: 'Thumbnail',
        type: 'image',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'imageCaption',
        title: 'Hero Image Caption',
        type: 'string',
      },
      {
        name: 'category',
        title: 'Category',
        type: 'string',
        options: {
          list: [
            { title: 'Meetup', value: 'meetup' },
            { title: 'Convention', value: 'convention' },
            { title: 'Screening', value: 'screening' },
            { title: 'Cosplay', value: 'cosplay' },
            { title: 'Other', value: 'other' },
          ],
        },
      },
      {
        name: 'section',
        title: 'Section',
        type: 'string',
        options: {
          list: [
            { title: 'Featured', value: 'Featured' },
            { title: 'Anime', value: 'Anime' },
            { title: 'Manga', value: 'Manga' },
            { title: 'Movies & TV Shows', value: 'Movies & TV Shows' },
            { title: 'Games', value: 'Games' },
          ],
        },
      },
      {
        name: 'panelClassName',
        title: 'Panel Class Name',
        type: 'string',
      },
      {
        name: 'textClassName',
        title: 'Text Class Name',
        type: 'string',
      },
      {
        name: 'itemClassName',
        title: 'Item Class Name',
        type: 'string',
      },
      {
        name: 'tag',
        title: 'Tag',
        type: 'string',
      },
      {
        name: 'commentsCount',
        title: 'Comments Count',
        type: 'number',
        initialValue: 0,
      },
      {
        name: 'isFeatured',
        title: 'Featured Story',
        type: 'boolean',
      },
      {
        name: 'tags',
        title: 'Tags',
        type: 'array',
        of: [{ type: 'string' }],
      },
      {
        name: 'author',
        title: 'Created By',
        type: 'reference',
        to: [{ type: 'author' }],
      },
      {
        name: 'organizers',
        title: 'Organizers',
        type: 'array',
        of: [
          {
            type: 'reference',
            to: [{ type: 'organizer' }]
          }
        ]
      },
      {
        name: 'attendees',
        title: 'Attendees',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'userId', type: 'string' },
              { name: 'name', type: 'string' },
              { name: 'avatar', type: 'image'},
              {
                name: 'status',
                type: 'string',
                options: {
                  list: [
                    { title: 'Going', value: 'going' },
                    { title: 'Maybe', value: 'maybe' },
                    { title: 'Not Going', value: 'not_going' },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        name: 'tournaments',
        title: 'Tournaments',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'title', type: 'string' },
              { name: 'prize',  type: 'string' },
              { name: 'participants', type: 'string' },
              { name: 'time', type: 'date' },
            ]
          }
        ]
      },
      {
        name: 'activities',
        title: 'Activities',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'title', type: 'string' },
              { name: 'description', type: 'string' },
              { name: 'time', type: 'string', validation: (Rule: any) => Rule.required() },
            ]
          }
        ]
      },
      {
        name: 'ticket',
        title: 'Ticket',
        type: 'string',
      },
      {
        name: 'gallery',
        title: 'Gallery',
        type: 'array',
        of: [{ type: 'image' }],
        options: {
          hotspot: true,
        },
      },
    ],
  };

export default eventSchema;
