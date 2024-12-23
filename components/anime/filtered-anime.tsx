import {Card} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import {Button} from "@/components/ui/button";
import {handleWatchClick} from "@/lib/utils";
import {Play, Star} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {motion} from "framer-motion";
import useFetchAnimeByGenre from "@/hooks/anime/use-fetch-anime-by-genre";
import {useInView} from "react-intersection-observer";
import {useEffect} from "react";
import {useWatchStore} from "@/store/use-watch-store";

interface Props {
    selectedGenre: string;
}

export default function FilteredAnime({selectedGenre}: Props) {
    const {setSelectedAnime} = useWatchStore();
    const {anime, isLoadingAnime, fetchNextPage, hasNextPage} = useFetchAnimeByGenre(selectedGenre);
    const {ref, inView} = useInView();

    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    const item = {
        hidden: {opacity: 0, y: 20},
        show: {opacity: 1, y: 0}
    };

    const animeList = anime?.pages.flatMap((page) => page.data) ?? []


    return (
        <>
            {isLoadingAnime && (
                Array(4).fill(null).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <div className="aspect-[2/3] bg-muted"/>
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"/>
                            <div className="h-4 bg-muted rounded w-1/2"/>
                        </div>
                    </Card>
                ))
            )}
            {animeList.map((anime: any) => (
                <motion.div
                    key={anime.mal_id}
                    variants={item}
                >
                    <Card className="overflow-hidden group">
                        <div className="relative aspect-[2/3]">
                            <Link href={`/anime/${anime.mal_id}`}>
                                <Image
                                    src={anime.images.jpg.large_image_url}
                                    alt={anime.title}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                />
                            </Link>
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute bottom-4 left-4 right-4">
                                    <Button
                                        className="w-full gap-2"
                                        asChild
                                        onClick={() => handleWatchClick(anime, setSelectedAnime)}
                                    >
                                        <Link href="/watch">
                                            <Play className="h-4 w-4"/>
                                            Watch Now
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="h-4 w-4 text-yellow-400 fill-current"/>
                                <span className="text-sm font-medium">{anime.score}</span>
                                <Badge variant="secondary" className="ml-auto">
                                    {anime.episodes} EP
                                </Badge>
                            </div>
                            <Link
                                href={`/anime/${anime.mal_id}`}
                                className="font-semibold hover:text-primary transition-colors line-clamp-1"
                            >
                                {anime.title}
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {anime.synopsis}
                            </p>
                        </div>
                    </Card>
                </motion.div>
            ))}
            <div ref={ref}/>
            {hasNextPage &&
                Array(8)
                    .fill(null)
                    .map((_, index) => (
                        <Card key={`next-page-loading-${index}`} className="animate-pulse">
                            <div className="aspect-[2/3] bg-muted"/>
                            <div className="p-4 space-y-2">
                                <div className="h-4 bg-muted rounded w-3/4"/>
                                <div className="h-4 bg-muted rounded w-1/2"/>
                            </div>
                        </Card>
                    ))}
        </>
    )
}