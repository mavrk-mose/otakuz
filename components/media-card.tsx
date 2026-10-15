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
            <Card className="overflow-hidden group border border-[#2b3245] bg-[#1c202c] hover:border-[#3f4865] transition-all duration-300 rounded-lg shadow-sm hover:shadow-md">
                <div className="relative aspect-[2/3]">
                    <Link href={detailUrl}>
                        <Image
                            src={imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </Link>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-[#0e1015]/90 via-[#0e1015]/20 to-transparent">
                        <div className="absolute bottom-4 left-4 right-4">
                            <Button className="w-full gap-2 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs font-medium h-9 rounded-md shadow-sm" asChild>
                                <Link href={actionUrl}>
                                    <ActionIcon className="h-4 w-4" />
                                    {actionText}
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
                        <div className="flex items-center gap-1 bg-[#14171f]/80 px-2 py-0.5 rounded-full text-[#f59e0b] text-xs font-semibold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{item.score ?? "N/A"}</span>
                        </div>
                        <Badge variant="secondary" className="ml-auto text-[10px] bg-[#242938] text-[#e0e2ed] border border-[#2b3245]">
                            {badgeText}
                        </Badge>
                    </div>
                    <Link
                        href={detailUrl}
                        className="font-semibold text-sm hover:text-[#6366f1] transition-colors line-clamp-1"
                    >
                        {item.title}
                    </Link>
                    <p className="text-xs text-[#8492a6] mt-1 line-clamp-2 leading-relaxed">
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
                    <Card key={index} className="animate-pulse border border-[#2b3245] bg-[#1c202c] rounded-lg">
                        <div className="aspect-[2/3] bg-[#242938]" />
                        <div className="p-3.5 space-y-2">
                            <div className="h-4 bg-[#242938] rounded w-3/4" />
                            <div className="h-3 bg-[#242938] rounded w-1/2" />
                        </div>
                    </Card>
                ))}
        </>
    );
}
