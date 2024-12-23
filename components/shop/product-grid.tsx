"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import useFetchProducts from "@/hooks/shop/use-fetch-products";
import {urlFor} from "@/lib/sanity";
import Lottie from "lottie-react";
import Pochita from "@/public/lottie/pochita.json";
import {ProductCard} from "@/components/shop/product-card";

interface ProductGridProps {
    title?: string
    filters?: {
        category: string[]
        price: string[]
    }
    sort?: string
}

export function ProductGrid({ title, filters, sort }: ProductGridProps) {
    const { products, isLoading } = useFetchProducts({ category: "all", title});

    const filteredProducts = products?.filter(product => {
        if (filters?.category.length && !filters.category.includes(product.category)) {
            return false
        }
        if (filters?.price.length) {
            const price = product.price
            const matchesPrice = filters.price.some(range => {
                if (range === 'under-25') return price < 25
                if (range === '25-50') return price >= 25 && price <= 50
                if (range === '50-100') return price >= 50 && price <= 100
                if (range === 'over-100') return price > 100
                return false
            })
            if (!matchesPrice) return false
        }

        return true
    }) || [];

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sort === 'price-low') return a.price - b.price
        if (sort === 'price-high') return b.price - a.price
        return 0
    })

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

    if (!products || products.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="text-lg font-semibold mb-4 text-neutral-300">No products found</div>
                    <div className="mx-auto w-48 h-48">
                        <Lottie
                            animationData={Pochita}
                            loop={true}
                        />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
                <ProductCard product={product} key={product._id}/>
            ))}
        </div>
    )
}

