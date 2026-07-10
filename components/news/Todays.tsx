"use client"

import Image from "next/image";
import Link from "next/link";
import { type NewsStory } from "@/types/news";
import { useI18n } from "@/components/i18n-provider";

interface StreamCardProps {
    id: string;
    title: string;
    author: string;
    time?: string;
    comments: number;
    tag: string;
    image?: string;
}

interface TodaysProps {
    stories?: NewsStory[];
}

const StreamCard = ({ id, title, author, time, comments, tag, image } : StreamCardProps) => {
    return (
        <Link
            href={`/news/${encodeURIComponent(id)}`}
            className="flex items-start justify-between gap-4 border-b p-4 transition duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
            <div className="flex min-w-0 flex-col justify-between">
                <span className="text-sm text-teal-500 uppercase">{tag}</span>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground">
                        {author} {time && `- ${time}`} | {comments} comments
                    </p>
                </div>
            </div>

            {image && (
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded">
                    <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="80px"
                        className="object-cover"
                    />
                </div>
            )}
        </Link>
    );
};

const TodaysStream = ({ stories = [] }: TodaysProps) => {
    const { locale, t } = useI18n();
    return (
        <div className="space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h2 className="text-lg font-bold text-green-500">{t("news.todayStream")}</h2>
            <div>
                {stories.map((story) => (
                    <StreamCard
                        key={story._id}
                        id={story._id}
                        title={story.title}
                        author={story.authorName || story.author?.name || t("news.staff")}
                        time={story.publishedAt ? new Date(story.publishedAt).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US") : undefined}
                        comments={story.commentsCount || 0}
                        tag={story.tag || "News"}
                        image={story.imageUrl}
                    />
                ))}
            </div>
        </div>
    );
};

export default TodaysStream;
