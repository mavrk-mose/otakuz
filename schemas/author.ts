export default {
    name: 'author',
    title: 'Authors',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'image',
            title: 'Image',
            type: 'image',  
            options: {
                hotspot: true,
            },
        },
        {
            name: 'bio',
            title: 'Bio',
            type: 'text',
        },
        {
            name: 'role',
            title: 'Role',
            type: 'string',
            options: {
                list: [
                    { title: 'Overlord', value: 'admin' },
                    { title: 'Editor', value: 'editor' },
                    { title: 'Writer', value: 'writer' },
                ],
            },
        },
    ],
};