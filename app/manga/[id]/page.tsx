"use client"

import DetailsSkeleton from "@/components/skeletons/details-skeleton";
import {Card} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Star, BookOpen, Users} from 'lucide-react';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {BookmarkButton} from "@/components/bookmark-button";
import Image from 'next/image';
import {use} from "react";
import {MangaRecommendations} from "@/components/manga/manga-recommendations";
import {MangaGallery} from "@/components/manga/manga-gallery";
import useMangaDetails from "@/hooks/manga/use-manga-details";
import { useGenreStore } from "@/store/use-genre-store";
import { useRouter } from "next/navigation"

interface Props {
    params: Promise<{ id: string }>;
}

export default function MangaDetailPage(props: Props) {
    const params = use(props.params);

    const {manga, isLoading} = useMangaDetails(params.id);
    const { mangaGenre, setMangaGenre } = useGenreStore();
    const router = useRouter();

    if (isLoading) {
        return (
            <DetailsSkeleton/>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-[350px_1fr] md:grid-cols-[300px_1fr] sm:grid-cols-1 gap-8">
                <div className="space-y-4 lg:sticky lg:top-4 self-start">
                    <Card className="overflow-hidden">
                        <Image
                            src={manga.images.jpg.large_image_url}
                            alt={manga.title}
                            width={300}
                            height={450}
                            className="w-full object-cover"
                        />
                    </Card>
                    <div className="grid grid-cols-2 gap-2">
                        <Button className="w-full gap-2">
                            <BookOpen className="w-4 h-4"/> Read Now
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                            <Users className="w-4 h-4"/> {manga.members.toLocaleString()}
                        </Button>
                        <BookmarkButton
                            itemId={manga.mal_id.toString()}
                            type="manga"
                            title={manga.title}
                            image={manga.images.jpg.large_image_url}
                        />
                    </div>
                    <Card className="p-4 space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Score</p>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500"/>
                                <span className="text-lg font-bold">{manga.score}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({manga.scored_by.toLocaleString()} users)
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Chapters</p>
                                <p className="font-medium">{manga.chapters || 'Ongoing'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Volumes</p>
                                <p className="font-medium">{manga.volumes || 'Ongoing'}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <p className="font-medium">{manga.status}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Type</p>
                                <p className="font-medium">{manga.type}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-col-1 space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{manga.title}</h1>
                        <h2 className="text-xl text-muted-foreground mb-4">
                            {manga.title_japanese}
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {manga.genres.map((genre: any) => (
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

                    <Tabs defaultValue="overview">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4 transition-opacity duration-300">
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Synopsis</h3>
                                <p className="leading-relaxed">{manga.synopsis}</p>
                            </Card>
                            <Card className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Authors</h4>
                                        <div className="space-y-1">
                                            {manga.authors.map((author: any) => (
                                                <p key={author.mal_id} className="text-sm text-muted-foreground">
                                                    {author.name}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Statistics</h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p>Rank: #{manga.rank}</p>
                                            <p>Popularity: #{manga.popularity}</p>
                                            <p>Members: {manga.members.toLocaleString()}</p>
                                            <p>Favorites: {manga.favorites.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                        <TabsContent value="gallery" className="space-y-4 transition-opacity duration-300">
                            <div className="mt-8 overflow-x-auto px-4">
                                <MangaGallery id={params.id}/>
                            </div>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-8 overflow-x-auto px-4">
                        <MangaRecommendations mangaId={params.id}/>
                    </div>
                </div>
            </div>
        </div>
    );
}