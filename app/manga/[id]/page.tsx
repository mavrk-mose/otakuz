"use client"

import { useState } from "react";
import DetailsSkeleton from "@/components/skeletons/details-skeleton";
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Star, BookOpen, Users, AlertCircle, RefreshCw, Share2} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {BookmarkButton} from "@/components/bookmark-button";
import Image from 'next/image';
import {use} from "react";
import {MangaRecommendations} from "@/components/manga/manga-recommendations";
import {MangaGallery} from "@/components/manga/manga-gallery";
import useMangaDetails from "@/hooks/manga/use-manga-details";
import { useGenreStore } from "@/store/use-genre-store";
import { useRouter } from "next/navigation"
import { useI18n } from "@/components/i18n-provider"
import { ShareContentModal } from "@/components/chat/share-content-modal"
import { useRecordWatchHistory } from "@/hooks/use-watch-history"

interface Props {
    params: Promise<{ id: string }>;
}

export default function MangaDetailPage(props: Props) {
    const { t } = useI18n();
    const params = use(props.params);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const {manga, isLoading, error, refetch, isFetching} = useMangaDetails(params.id);
    const { mangaGenre, setMangaGenre } = useGenreStore();
    const router = useRouter();

    useRecordWatchHistory(
        manga
            ? {
                  itemId: String(manga.mal_id),
                  type: "manga",
                  title: manga.title,
                  subtitle: [
                      manga.type || "Manga",
                      manga.chapters ? `${manga.chapters} ch` : null,
                      manga.score ? `★ ${manga.score}` : null,
                  ]
                      .filter(Boolean)
                      .join(" • "),
                  image:
                      manga.images?.jpg?.large_image_url ||
                      manga.images?.jpg?.image_url ||
                      "",
                  href: `/manga/${manga.mal_id}`,
              }
            : null
    );

    if (isLoading) {
        return (
            <DetailsSkeleton type="manga"/>
        );
    }

    if (error || !manga) {
        const isNotFound = !/^\d+$/.test(params.id) || error?.status === 404;

        return (
            <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
                <Card className="w-full max-w-lg p-8 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground"/>
                    <h1 className="mt-4 text-2xl font-bold">
                        {isNotFound ? t("manga.notFound") : t("manga.loadFailed")}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isNotFound
                            ? t("manga.notFoundDescription")
                            : t("manga.loadFailedDescription")}
                    </p>
                    {!isNotFound && (
                        <Button
                            type="button"
                            className="mt-6 gap-2"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}/>
                            {t("common.tryAgain")}
                        </Button>
                    )}
                </Card>
            </div>
        );
    }

    const coverImage = manga.images?.jpg?.large_image_url
        || manga.images?.jpg?.image_url
        || "/assets/logo.png";
    const formatNumber = (value: number | null | undefined) => value?.toLocaleString() ?? "—";

    return (
        <div className="container mx-auto max-w-full px-4 py-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
                <div className="min-w-0 space-y-4 self-start lg:sticky lg:top-4">
                    <Card className="overflow-hidden">
                        <Image
                            src={coverImage}
                            alt={manga.title}
                            width={300}
                            height={450}
                            className="w-full object-cover"
                        />
                    </Card>
                    <div className="grid grid-cols-2 gap-2">
                        <Button className="w-full gap-2">
                            <BookOpen className="w-4 h-4"/> {t("manga.readNow")}
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                            <Users className="w-4 h-4"/> {formatNumber(manga.members)}
                        </Button>
                        <BookmarkButton
                            itemId={manga.mal_id.toString()}
                            type="manga"
                            title={manga.title}
                            image={coverImage}
                        />
                        <Button
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            <Share2 className="w-4 h-4" /> {t("anime.shareChat") || "Share to Chat"}
                        </Button>
                    </div>
                    <Card className="p-4 space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">{t("common.score")}</p>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500"/>
                                <span className="text-lg font-bold">{manga.score}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({formatNumber(manga.scored_by)} {t("anime.users")})
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">{t("manga.chapters")}</p>
                                <p className="font-medium">{manga.chapters || t("manga.ongoing")}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">{t("manga.volumes")}</p>
                                <p className="font-medium">{manga.volumes || t("manga.ongoing")}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">{t("common.status")}</p>
                                <p className="font-medium">{manga.status}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">{t("common.type")}</p>
                                <p className="font-medium">{manga.type}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="min-w-0 max-w-full space-y-6">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold mb-2 break-words">{manga.title}</h1>
                        <h2 className="text-lg sm:text-xl text-muted-foreground mb-4 break-words">
                            {manga.title_japanese}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {manga.genres?.map((genre: any) => (
                                <Badge 
                                    key={genre.mal_id} 
                                    variant="secondary"
                                    onClick={() => {
                                        setMangaGenre(genre.mal_id.toString());
                                        router.push('/manga');
                                    }}
                                    className="cursor-pointer"
                                >
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Tabs defaultValue="overview" className="w-full min-w-0">
                        <TabsList>
                            <TabsTrigger value="overview">{t("anime.overview")}</TabsTrigger>
                            <TabsTrigger value="gallery">{t("common.gallery")}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="min-w-0 space-y-4 transition-opacity duration-300">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">{t("common.synopsis")}</h3>
                                <p className="leading-relaxed">{manga.synopsis}</p>
                            </Card>
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">{t("common.information")}</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">{t("manga.authors")}</h4>
                                        <div className="space-y-1">
                                            {manga.authors?.map((author: any) => (
                                                <p key={author.mal_id} className="text-sm text-muted-foreground">
                                                    {author.name}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">{t("common.statistics")}</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>{t("common.ranked")}: #{manga.rank}</p>
                                            <p>{t("common.popularity")}: #{manga.popularity}</p>
                                            <p>{t("anime.members")}: {formatNumber(manga.members)}</p>
                                            <p>{t("anime.favorites")}: {formatNumber(manga.favorites)}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                        <TabsContent value="gallery" className="min-w-0 max-w-full space-y-4 transition-opacity duration-300">
                            <div className="mt-4 min-w-0 w-full max-w-full">
                                <MangaGallery id={params.id}/>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-8 min-w-0 w-full max-w-full">
                        <MangaRecommendations mangaId={params.id}/>
                    </div>
                </div>
            </div>
            <ShareContentModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                payload={{
                    type: 'manga',
                    data: {
                        id: manga.mal_id,
                        title: manga.title,
                        image: coverImage,
                        score: manga.score ?? undefined,
                        chapters: manga.chapters ?? undefined,
                        authors: manga.authors?.map((a: any) => a.name) || [],
                    },
                }}
            />
        </div>
    );
}
