export default {
    name: 'category',
    title: 'Categories',
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
            name: 'icon',
            title: 'Icon',
            type: 'string',
            description: 'Lucide icon name',
        },
    ],
};