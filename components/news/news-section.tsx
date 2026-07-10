"use client"

import {useQuery} from '@tanstack/react-query';
import {getAnimeNews} from '@/lib/api';
import {Card} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {ArrowRight, CalendarDays} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {Button} from "@/components/ui/button";
import { useI18n } from '@/components/i18n-provider';

export function NewsSection() {
    const { locale, t } = useI18n();
    const {data: newsList, isLoading} = useQuery({
        queryKey: ['animeNews'],
        queryFn: getAnimeNews
    });

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-32 bg-muted rounded-md animate-pulse mb-2"/>
                        <div className="h-6 w-48 bg-muted rounded-md animate-pulse"/>
                    </div>
                    <div className="h-8 w-24 bg-muted rounded-md animate-pulse"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="overflow-hidden bg-muted rounded-md animate-pulse">
                            <div className="flex gap-4">
                                <div className="relative w-48 aspect-video bg-muted rounded-md"/>
                                <div className="flex-1 p-4 space-y-4">
                                    <div className="h-5 w-24 bg-muted rounded-md"/>
                                    <div className="h-6 w-full bg-muted rounded-md"/>
                                    <div className="h-4 w-32 bg-muted rounded-md"/>
                                    <div className="h-4 w-3/4 bg-muted rounded-md"/>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">{t("home.latestNews")}</h2>
                    <p className="text-muted-foreground">{t("home.latestNewsDescription")}</p>
                </div>
                <Button variant="ghost" asChild>
                    <Link href="/news" className="gap-2">
                        {t("common.viewAll")} <ArrowRight className="w-4 h-4"/>
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {newsList?.slice(0, 6).map((news: any) => (
                    <Card key={news.mal_id} className="overflow-hidden">
                        <Link href={news.url} target="_blank" className="flex gap-4">
                            <div className="relative w-48 aspect-video">
                                <Image
                                    src={news.images.jpg.image_url}
                                    alt={news.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 p-4">
                                <Badge className="mb-2">{news.author_username}</Badge>
                                <h3 className="font-semibold line-clamp-2 mb-2">
                                    {news.title}
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <CalendarDays className="h-4 w-4 mr-2"/>
                                    {new Date(news.date).toLocaleDateString(locale === "ja" ? "ja-JP" : "en-US")}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {news.excerpt}
                                </p>
                            </div>
                        </Link>
                    </Card>
                ))}
            </div>
        </div>
    );
}
