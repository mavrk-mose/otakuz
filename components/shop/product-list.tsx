"use client"

import { useInfiniteQuery } from '@tanstack/react-query';
import { ProductCard } from './product-card';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { getProducts } from '@/lib/sanity';

interface ProductListProps {
  category?: string;
  priceRange?: [number, number];
  sortBy?: string;
}

export function ProductList({ category, priceRange, sortBy }: ProductListProps) {
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', category, priceRange, sortBy],
    queryFn: async ({ pageParam = 0 }) => {
      const products = await getProducts();
      // Filter and sort products based on criteria
      let filteredProducts = products;
      
      if (category && category !== 'all') {
        filteredProducts = filteredProducts.filter((p: { category: string; }) => p.category === category);
      }
      
      if (priceRange) {
        filteredProducts = filteredProducts.filter(
          (          p: { price: number; }) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );
      }
      
      if (sortBy) {
        filteredProducts.sort((a: { price: number; rating: number; }, b: { price: number; rating: number; }) => {
          switch (sortBy) {
            case 'price-low':
              return a.price - b.price;
            case 'price-high':
              return b.price - a.price;
            case 'rating':
              return b.rating - a.rating;
            default:
              return 0;
          }
        });
      }
      
      const start = pageParam * 12;
      const end = start + 12;
      return {
        items: filteredProducts.slice(start, end),
        nextPage: end < filteredProducts.length ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || !data.pages.some((page) => page.items.length > 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">No products found</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.map((page) =>
          page.items.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>

      <div ref={ref} className="flex justify-center">
        {hasNextPage && (
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
      </div>
    </div>
  );
}