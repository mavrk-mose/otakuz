"use client"

import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";

import { ProductCardSkeleton } from "@/components/shop/product-card-skeleton";

import useFetchProducts from "@/hooks/shop/use-fetch-products";
import {ProductCard} from "@/components/shop/product-card";
import { useI18n } from "@/components/i18n-provider";

interface ProductGridProps {
    title?: string
    filters?: {
        category: string[]
        price: string[]
    }
    sort?: string
}

export function ProductGrid({ title, filters, sort }: ProductGridProps) {
    const { t } = useI18n();
    const { products, isLoading, isError, refetch } = useFetchProducts({ category: "all", title});

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
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        )
    }

    if (isError && !products?.length) {
        return <ErrorState title={t("shop.loadError")} onRetry={() => void refetch()} />;
    }

    if (sortedProducts.length === 0) {
        return <EmptyState illustration="collection" title={t("common.noProducts")} description={t("empty.shopDescription")} />;
    }

    return (
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {sortedProducts.map((product) => (
                <ProductCard product={product} key={product._id}/>
            ))}
        </div>
    )
}
