export default {
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
        name: 'description',
        title: 'Description',
        type: 'text',
      },
      {
        name: 'date',
        title: 'Date',
        type: 'date',
        validation: (Rule: any) => Rule.required(),
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
        name: 'attendees',
        title: 'Attendees',
        type: 'array',
        of: [
          {
            type: 'object',
            fields: [
              { name: 'userId', type: 'string' },
              { name: 'name', type: 'string' },
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