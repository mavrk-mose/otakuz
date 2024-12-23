"use client"

import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area'
import Image from "next/image"
import Link from "next/link"
import {motion} from 'framer-motion'
import {ProductList} from "@/components/shop/product-list"
import {CategoryList} from "@/components/shop/category-list"
import {ShowBanner} from "@/components/shop/show-banner"
import {ArrowRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import useFetchTitles from "@/hooks/shop/use-fetch-titles";
import {urlFor} from "@/lib/sanity";
import TitleBanner from "@/components/shop/title-banner";

//TODO: fetch from sanity
const featuredBanners = [
    {
        title: "Demon Slayer",
        subtitle: "New Collection",
        image: "https://www.pixelstalk.net/wp-content/uploads/images6/Demon-Slayer-HD-Wallpaper-4K-Free-download-620x388.jpg",
        color: "from-red-500/20"
    },
    {
        title: "Chainsaw Man",
        subtitle: "Limited Edition",
        image: "https://www.themarysue.com/wp-content/uploads/2023/09/chainsaw-man-power-denji.jpg.webp?w=1200",
        color: "from-orange-500/20"
    }
]

export default function ShopPage() {
    return (
        <div className="min-h-screen bg-black text-white pb-4">
            {/* Featured Products */}
            <section className="py-4">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h2 className="text-2xl font-semibold mb-8">New Arrivals</h2>
                    <ProductList
                        category="all"
                        limit={4}
                    />
                </div>
            </section>

            {/* Shop By Title */}
            <section className="py-4">
                <div className="container mx-auto px-4 max-w-7xl">
                    <h2
                        className="text-[4rem] font-bold mb-8 leading-none tracking-tighter text-transparent"
                        style={{WebkitTextStroke: '2px white'}}
                    >
                        Shop By Title
                    </h2>
                    <TitleBanner/>
                </div>
            </section>

            {/* Show Banners */}
            <section className="py-12">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredBanners.map((banner, idx) => (
                                <ShowBanner key={idx} {...banner} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Shop By Category */}
                <section className="py-12">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <h2
                            className="text-[4rem] font-bold mb-8 leading-none tracking-tighter text-transparent"
                            style={{WebkitTextStroke: '2px white'}}
                        >
                            Shop By Category
                        </h2>
                        <CategoryList/>
                    </div>
                </section>

                {/* All Products */}
                <section className="py-12">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold mb-8">All Products</h2>
                            <Button variant="ghost" asChild>
                                <Link href="/anime" className="gap-2">
                                    View All <ArrowRight className="w-4 h-4"/>
                                </Link>
                            </Button>
                        </div>

                        <ScrollArea className="w-full whitespace-nowrap">
                            <ProductList
                                category="all"
                                limit={8}
                            />
                            <ScrollBar orientation="horizontal"/>
                        </ScrollArea>
                    </div>
                </section>
            </div>
            )
            }

