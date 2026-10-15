"use client";

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
            <Card className="overflow-hidden group">
                <div className="relative aspect-[2/3]">
                    <Link href={detailUrl}>
                        <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                        />
                    </Link>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/80 via-black/0 to-black/0">
                        <div className="absolute bottom-4 left-4 right-4">
                            <Button className="w-full gap-2" asChild>
                                <Link href={actionUrl}>
                                    <ActionIcon className="h-4 w-4" />
                                    {actionText}
                                </Link>
                            </Button>
                        </div>
                    </div>
                    {showBookmark && (
                        <div className="absolute top-4 right-4">
                            <BookmarkButton
                                itemId={item.mal_id.toString()}
                                type={type}
                                title={item.title}
                                image={imageUrl}
                            />
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{item.score ?? "N/A"}</span>
                        <Badge variant="secondary" className="ml-auto">
                            {badgeText}
                        </Badge>
                    </div>
                    <Link
                        href={detailUrl}
                        className="font-semibold hover:text-primary transition-colors line-clamp-1"
                    >
                        {item.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.synopsis}
                    </p>
                </div>
            </Card>
        </motion.div>
    );
}

export function MediaCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <>
            {Array(count)
                .fill(null)
                .map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <div className="aspect-[2/3] bg-muted" />
                        <div className="p-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                        </div>
                    </Card>
                ))}
        </>
    );
}
