"use client"

import { useAnimeDetail } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, PlayCircle, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import DetailsSkeleton from "@/components/skeletons/DetailsSkeleton";
import { AnimeRecommendations } from './anime-recommendations';
import { AnimeGallery } from './anime-gallery';

export default function AnimeDetailClient({ id }: { id: string }) {
    const { data: anime, isLoading } = useAnimeDetail(id);

    if (isLoading) {
        return (
            <DetailsSkeleton />
        );
    }

    if (!anime) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">Anime not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-[350px_1fr] md:grid-cols-[300px_1fr] sm:grid-cols-1 gap-8">
                <div className="space-y-4">
                    <Card className="overflow-hidden">
                        <Image
                            src={anime.images.jpg.large_image_url}
                            alt={anime.title}
                            width={300}
                            height={450}
                            className="w-full object-cover"
                        />
                    </Card>
                    <div className="grid grid-cols-2 gap-2">
                        <Button className="w-full gap-2" asChild>
                            <Link href={`/watch/${anime.mal_id}`}>
                                <PlayCircle className="w-4 h-4" /> Watch Now
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                            <Heart className="w-4 h-4" /> Add to List
                        </Button>
                    </div>
                    <Card className="p-4 space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Score</p>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="text-lg font-bold">{anime.score}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({anime.scored_by.toLocaleString()} users)
                                </span>
                            </div>
                        </div>
                        <Progress value={anime.score * 10} className="h-2" />
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Ranked</p>
                                <p className="font-medium">#{anime.rank}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Popularity</p>
                                <p className="font-medium">#{anime.popularity}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Episodes</p>
                                <p className="font-medium">{anime.episodes}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Duration</p>
                                <p className="font-medium">{anime.duration}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
                        <h2 className="text-xl text-muted-foreground mb-4">{anime.title_japanese}</h2>
                        <div className="flex flex-wrap gap-2">
                            {anime.genres.map((genre) => (
                                <Badge key={genre.mal_id} variant="secondary">
                                    {genre.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <Tabs defaultValue="overview">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="characters">Characters</TabsTrigger>
                            <TabsTrigger value="episodes">Episodes</TabsTrigger>
                            <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="space-y-4 transition-opacity duration-300">
                            <Card className="p-6">
                                <p className="leading-relaxed">{anime.synopsis}</p>
                            </Card>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card className="p-4">
                                    <h3 className="font-semibold mb-2">Information</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Type</dt>
                                            <dd>{anime.type}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Status</dt>
                                            <dd>{anime.status}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Aired</dt>
                                            <dd>{anime.aired.from}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Season</dt>
                                            <dd>{anime.season} {anime.year}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Studios</dt>
                                            <dd>{anime.studios.map(s => s.name).join(', ')}</dd>
                                        </div>
                                    </dl>
                                </Card>
                                <Card className="p-4">
                                    <h3 className="font-semibold mb-2">Statistics</h3>
                                    <dl className="space-y-2 text-sm">
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Score</dt>
                                            <dd>{anime.score} ({anime.scored_by.toLocaleString()} users)</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Ranked</dt>
                                            <dd>#{anime.rank}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Popularity</dt>
                                            <dd>#{anime.popularity}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Members</dt>
                                            <dd>{anime.members.toLocaleString()}</dd>
                                        </div>
                                        <div className="flex">
                                            <dt className="w-24 text-muted-foreground">Favorites</dt>
                                            <dd>{anime.favorites.toLocaleString()}</dd>
                                        </div>
                                    </dl>
                                </Card>
                            </div>
                        </TabsContent>
                        <TabsContent value="characters">
                            <Card className="p-6">
                                <p className="text-muted-foreground">Character information coming soon...</p>
                            </Card>
                        </TabsContent>
                        <TabsContent value="episodes">
                            <Card className="p-6">
                                <p className="text-muted-foreground">Episode list coming soon...</p>
                            </Card>
                        </TabsContent>
                        <TabsContent value="gallery">
                            <Card className="p-6">
                                <AnimeGallery {...{id}} />
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <div className="mt-8 overflow-x-auto px-4">
                        <AnimeRecommendations animeId={id} />
                    </div>
                </div>
            </div>
        </div>
    );
}