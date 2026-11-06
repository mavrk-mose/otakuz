"use client";

import { AnimeHoverPreview } from "@/components/anime/anime-hover-preview";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Star, Play, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "@/components/bookmark-button";

export interface MediaItemData {
    mal_id: number;
    title: string;
    images: {
        webp?: { image_url?: string };
        jpg?: { image_url?: string; large_image_url?: string };
    };
    score?: number | null;
    episodes?: number | null;
    chapters?: number | null;
    synopsis?: string | null;
}

export interface MediaCardProps {
    item: MediaItemData;
    type: "anime" | "manga";
    showBookmark?: boolean;
}

export function MediaCard({ item, type, showBookmark = false }: MediaCardProps) {
    const isAnime = type === "anime";
    const imageUrl =
        item.images?.webp?.image_url ||
        item.images?.jpg?.large_image_url ||
        item.images?.jpg?.image_url ||
        "";

    const detailUrl = `/${type}/${item.mal_id}`;
    const actionUrl = isAnime ? `/watch/${item.mal_id}` : detailUrl;
    const actionText = isAnime ? "Watch Now" : "Read Now";
    const ActionIcon = isAnime ? Play : BookOpen;

    const badgeText = isAnime
        ? `${item.episodes ?? 0} EP`
        : `${item.chapters || "Ongoing"} CH`;

    const animationItem = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <motion.div variants={animationItem}>
            <AnimeHoverPreview animeId={item.mal_id} title={item.title} poster={imageUrl} enabled={isAnime}>
            <Card className="media-card-surface overflow-hidden group rounded-lg">
                <div className="relative aspect-[2/3]">
                    <Link href={detailUrl}>
                        <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity bg-gradient-to-t from-[#0e1015]/90 via-[#0e1015]/20 to-transparent">
                        <div className={`absolute left-4 right-4 ${isAnime ? "inset-y-0 flex items-center justify-center" : "bottom-4"}`}>
                            <Button className={isAnime ? "h-14 w-14 rounded-full shadow-lg" : "w-full gap-2 text-xs font-medium h-9 rounded-md shadow-sm"} size={isAnime ? "icon" : "default"} asChild>
                                <Link href={actionUrl} aria-label={isAnime ? `Play ${item.title}` : undefined}>
                                    <ActionIcon className={isAnime ? "h-6 w-6 fill-current" : "h-4 w-4"} />
                                    {!isAnime && actionText}
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {showBookmark && (
                        <div className="absolute top-3 right-3">
                            <BookmarkButton
                                itemId={item.mal_id.toString()}
                                type={type}
                                title={item.title}
                                image={imageUrl}
                            />
                        </div>
                    )}
                </div>
                <div className="p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full text-amber-600 dark:text-amber-400 text-xs font-semibold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{item.score ?? "N/A"}</span>
                        </div>
                        <Badge variant="secondary" className="ml-auto text-[10px] bg-muted text-muted-foreground border border-border">
                            {badgeText}
                        </Badge>
                    </div>
                    <Link
                        href={detailUrl}
                        className="font-semibold text-sm text-card-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                        {item.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {item.synopsis}
                    </p>
                </div>
            </Card>
            </AnimeHoverPreview>
        </motion.div>
    );
}

export function MediaCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array(count)
                .fill(null)
                .map((_, index) => (
                    <Card key={index} className="animate-pulse border border-border bg-card rounded-lg">
                        <div className="aspect-[2/3] bg-muted" />
                        <div className="p-3.5 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                    </Card>
                ))}
        </>
    );
}
