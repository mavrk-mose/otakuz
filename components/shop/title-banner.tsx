"use client"

import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import Link from "next/link";
import {motion} from "framer-motion";
import Image from "next/image";
import {urlFor} from "@/lib/sanity";
import useFetchTitles from "@/hooks/shop/use-fetch-titles";

export default function TitleBanner() {
    const {titles, isLoading} = useFetchTitles();

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-[3/4] bg-neutral-800 rounded-lg mb-4"/>
                        <div className="space-y-2">
                            <div className="h-4 bg-neutral-800 rounded w-3/4"/>
                            <div className="h-4 bg-neutral-800 rounded w-1/2"/>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-4">
                {titles?.map((show) => (
                    <Link
                        key={show.name}
                        href={`/shop/filter/${show.name}`}
                        className="relative group"
                    >
                        <motion.div
                            className="w-[300px] h-[450px] relative overflow-hidden rounded-lg"
                            whileHover={{scale: 1.05}}
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
                            <div className="absolute bottom-4 left-4 z-20">
                                <h3 className="text-2xl font-bold">{show.name}</h3>
                                <p className="text-sm text-gray-300">Shop Collection</p>
                            </div>
                        </motion.div>
                    </Link>
                ))}
            </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    )
}