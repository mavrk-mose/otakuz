"use client"

import { Button } from "@/components/ui/button";
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
    const { products = [], isLoading, isError, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = useFetchProducts({ title, categories: filters?.category, priceRanges: filters?.price, sort });

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

    if (products.length === 0) {
        return <EmptyState illustration="collection" title={t("common.noProducts")} description={t("empty.shopDescription")} />;
    }

    return (
        <><div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
                <ProductCard product={product} key={product._id}/>
            ))}
        </div>{hasNextPage && <Button className="mt-6" disabled={isFetchingNextPage} onClick={() => void fetchNextPage()}>{t(isFetchingNextPage ? "common.loading" : "common.loadMore")}</Button>}</>
    )
}
