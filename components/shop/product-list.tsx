"use client";

import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";

import { ProductCardSkeleton } from "@/components/shop/product-card-skeleton";

import { ProductCard } from "./product-card";
import useFetchProducts from "@/hooks/shop/use-fetch-products";
import { useI18n } from "@/components/i18n-provider";

interface ProductListProps {
  category?: string;
  limit?: number;
}

export function ProductList({ category = "all", limit }: ProductListProps) {
  const { t } = useI18n();
  const { products, isLoading, isError, refetch } = useFetchProducts({
    category,
    limit: limit ?? 24,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        {[...Array(limit || 8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError && !products?.length) {
    return <ErrorState title={t("shop.loadError")} onRetry={() => void refetch()} />;
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        illustration="collection"
        title={t("common.noProducts")}
        description={t("empty.shopDescription")}
      />
    );
  }

  const displayProducts = products;

  return (
    <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {displayProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
