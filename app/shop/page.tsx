"use client"

import {ScrollArea, ScrollBar} from '@/components/ui/scroll-area'
import Image from "next/image"
import Link from "next/link"
import {motion} from 'framer-motion'
import {ProductList} from "@/components/shop/product-list"
import {CategoryList} from "@/components/shop/category-list"
import {ShowBanner} from "@/components/shop/show-banner"

//TODO: these will be fetched from sanity
const shows = [
    {
        title: "Chainsaw Man",
        image: "https://tradejapanstore.com/cdn/shop/products/chainsaw-man-manga-vol-12-front-cover.jpg?v=1664504644&width=600",
        slug: "chainsaw-man"
    },
    {
        title: "Demon Slayer",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/9322.jpg",
        slug: "demon-slayer"
    },
    {
        title: "Dandadan",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/19468.jpg",
        slug: "dandadan"
    },
    {
        title: "Tokyo Ghoul",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/10742.jpg",
        slug: "tokyo-ghoul"
    },
    {
        title: "Berserk",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/13631.jpg",
        slug: "berserk"
    },
    {
        title: "One Piece",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/12504.png",
        slug: "one-piece"
    }
]

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
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Featured Products */}
            <section className="py-12">
                <div className="container px-4">
                    <h2 className="text-2xl font-semibold mb-8">New Arrivals</h2>
                    <ProductList category="all" limit={4}/>
                </div>
            </section>

            {/* Shop By Title */}
            <section className="py-12 relative">
                <div className="container px-4">
                    <h2
                        className="text-[4rem] font-bold mb-8 leading-none tracking-tighter text-transparent"
                        style={{WebkitTextStroke: '2px white'}}
                    >
                        Shop By Title
                    </h2>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4">
                            {shows.map((show) => (
                                <Link
                                    key={show.slug}
                                    href={`/shop/${show.slug}`}
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
                                            src={show.image}
                                            alt={show.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <h3 className="text-2xl font-bold">{show.title}</h3>
                                            <p className="text-sm text-gray-300">Shop Collection</p>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                        <ScrollBar orientation="horizontal"/>
                    </ScrollArea>
                </div>
            </section>

            {/* Show Banners */}
            <section className="py-12">
                <div className="container px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {featuredBanners.map((banner, idx) => (
                            <ShowBanner key={idx} {...banner} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop By Category */}
            <section className="py-12">
                <div className="container px-4">
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
                <div className="container px-4">
                    <h2 className="text-2xl font-semibold mb-8">All Products</h2>
                    <ProductList category="all"/>
                </div>
            </section>
        </div>
    )
}

