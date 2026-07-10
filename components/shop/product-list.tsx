"use client"

import { ProductCard } from './product-card'
import useFetchProducts from "@/hooks/shop/use-fetch-products"
import Lottie from "lottie-react"
import Pochita from "@/public/lottie/pochita.json"
import { useI18n } from "@/components/i18n-provider"

interface ProductListProps {
    category?: string
    limit?: number
}

export function ProductList({ category = "all", limit }: ProductListProps) {
    const { t } = useI18n()
    const { products, isLoading } = useFetchProducts({ category })

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(limit || 8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="mb-4 aspect-[3/4] rounded-lg bg-muted" />
                        <div className="space-y-2">
                            <div className="h-4 w-3/4 rounded bg-muted" />
                            <div className="h-4 w-1/2 rounded bg-muted" />
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
                    <div className="mb-4 text-lg font-semibold text-muted-foreground">{t("common.noProducts")}</div>
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

    const displayProducts = limit ? products.slice(0, limit) : products

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    )
}
