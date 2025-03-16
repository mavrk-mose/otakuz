import { google } from 'googleapis';
import { client } from './sanity';

const youtube = google.youtube('v3');

// List of anime YouTube channels to monitor
const YOUTUBE_CHANNELS = [
    {
        id: 'UCxxnxya_32jcKj4yN1_kD7A', // Crunchyroll
        name: 'Crunchyroll Collection'
    },
    {
        id: 'UC0wNSTMWIL3qaorLx0jie6A', // Funimation
        name: 'Funimation'
    },
    {
        id: 'UCotXwY6s8pWmuWd_snKYjhg', // Gigguk
        name: 'Gigguk'
    },
    // Add more channels as needed
];

export async function fetchLatestVideos() {
    try {
        const videos = [];

        for (const channel of YOUTUBE_CHANNELS) {
            const response = await youtube.search.list({
                key: process.env.YOUTUBE_API_KEY,
                part: ['snippet'],
                channelId: channel.id,
                order: 'date',
                maxResults: 5,
                type: ['video'],
                publishedAfter: new Date(
                    Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
                ).toISOString()
            });

            if (response.data.items) {
                for (const item of response.data.items) {
                    const videoDetails = await youtube.videos.list({
                        key: process.env.YOUTUBE_API_KEY,
                        part: ['snippet', 'statistics'],
                        id: [item.id?.videoId || '']
                    });

                    if (videoDetails.data.items?.[0]) {
                        const video = videoDetails.data.items[0];
                        videos.push({
                            id: video.id,
                            title: video.snippet?.title,
                            description: video.snippet?.description,
                            thumbnailUrl: video.snippet?.thumbnails?.maxres?.url ||
                                video.snippet?.thumbnails?.high?.url,
                            channelTitle: channel.name,
                            publishedAt: video.snippet?.publishedAt,
                            viewCount: video.statistics?.viewCount,
                            likeCount: video.statistics?.likeCount
                        });
                    }
                }
            }
        }

        return videos;
    } catch (error) {
        console.error('Error fetching YouTube videos:', error);
        throw error;
    }
}

export async function createVideoArticle(video: any) {
    try {
        // Use GPT to generate an article about the video
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are an expert anime content creator and journalist. Write engaging articles about anime-related YouTube videos."
                },
                {
                    role: "user",
                    content: `Write an article about this YouTube video:\nTitle: ${video.title}\nDescription: ${video.description}\nChannel: ${video.channelTitle}`
                }
            ],
        });

        const article = await client.create({
            _type: 'article',
            title: video.title,
            content: [{
                _type: 'block',
                children: [{
                    _type: 'span',
                    text: completion.choices[0].message.content
                }]
            }],
            mainImage: {
                _type: 'image',
                asset: {
                    _type: 'reference',
                    _ref: await uploadThumbnail(video.thumbnailUrl)
                }
            },
            youtubeEmbed: {
                videoId: video.id,
                title: video.title
            },
            publishedAt: video.publishedAt,
            author: {
                _type: 'reference',
                _ref: 'ai-author'
            },
            source: {
                name: video.channelTitle,
                url: `https://www.youtube.com/watch?v=${video.id}`
            },
            isAiGenerated: true,
            type: 'video'
        });

        return article;
    } catch (error) {
        console.error('Error creating video article:', error);
        throw error;
    }
}

async function uploadThumbnail(thumbnailUrl: string) {
    try {
        const response = await fetch(thumbnailUrl);
        const buffer = await response.buffer();
        const asset = await client.assets.upload('image', buffer);
        return asset._id;
    } catch (error) {
        console.error('Error uploading thumbnail:', error);
        throw error;
    }
}