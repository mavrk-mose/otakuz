"use client"

import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {motion} from "framer-motion";
import Image from "next/image";
import {urlFor} from "@/lib/sanity";
import useFetchTitles from "@/hooks/shop/use-fetch-titles";
import { useI18n } from "@/components/i18n-provider";

export default function TitleBanner() {
    const { t } = useI18n();
    const {titles, isLoading} = useFetchTitles();

    if (isLoading) {
        return <ScrollArea className="w-full min-w-0 max-w-full" aria-busy="true" aria-label="Loading collections">
            <div className="flex w-max gap-4 py-2" aria-hidden="true">
                {Array.from({ length: 4 }, (_, i) => <div key={i} className="relative h-[360px] w-[240px] shrink-0 overflow-hidden rounded-lg sm:h-[420px] sm:w-[280px] md:h-[450px] md:w-[300px]">
                    <Skeleton className="absolute inset-0" />
                    <div className="absolute bottom-4 left-4 right-4 space-y-2"><Skeleton className="h-8 w-3/4 bg-muted-foreground/20" /><Skeleton className="h-5 w-20 bg-muted-foreground/20" /></div>
                </div>)}
            </div><ScrollBar orientation="horizontal" />
        </ScrollArea>;
    }

    return (
        <ScrollArea className="w-full min-w-0 max-w-full" scrollStep={420}>
            <div className="flex w-max gap-4 py-2">
                {titles?.map((show: any) => (
                    <Link
                        key={show.name}
                        href={{ pathname: "/shop/products", query: { anime: show.name } }}
                        className="relative group shrink-0"
                    >
                        <motion.div
                            className="w-[240px] sm:w-[280px] md:w-[300px] h-[360px] sm:h-[420px] md:h-[450px] relative overflow-hidden rounded-lg"
                            whileHover={{scale: 1.03}}
                            transition={{duration: 0.2}}
                        >
                            <div
                                className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10"/>
                            <Image
                                src={urlFor(show?.image.asset._ref).url()}
                                alt={show.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute bottom-4 left-4 z-20 text-white">
                                <h3 className="text-2xl font-bold">{show.name}</h3>
                                <p className="text-sm text-white/80">{t("shop.collection")}</p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    )
}
