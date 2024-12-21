"use client"

import { motion } from 'framer-motion'
import Image from 'next/image'
import useFetchProducts from "@/hooks/shop/use-fetch-products";
import {urlFor} from "@/lib/sanity";

interface ProductGridProps {
    show?: string
    filters?: {
        category: string[]
        price: string[]
    }
    sort: string
}

export function ProductGrid({ show, filters, sort }: ProductGridProps) {
    const { products, isLoading } = useFetchProducts({ category: "all"});

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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
                <motion.div
                    key={product._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group cursor-pointer"
                >
                    <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                        <Image
                            src={urlFor(product?.image[0].asset._ref).url()}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                    <h3 className="font-medium text-gray-200 group-hover:text-white transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-gray-400">${product.price.toFixed(2)}</p>
                </motion.div>
            ))}
        </div>
    )
}

