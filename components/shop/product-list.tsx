"use client"

import {useQuery} from '@tanstack/react-query';
import { ProductCard } from './product-card';
import { getProducts } from '@/lib/sanity';
import {Product} from "@/types/shop";

interface ProductListProps {
  category?: string;
  priceRange?: [number, number];
  sortBy?: string;
}

export function ProductList({ category, priceRange, sortBy }: ProductListProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['products', category, priceRange, sortBy],
        queryFn: async () => {
            // Fetch all products
            let filteredProducts: Product[] = await getProducts();

            // Filter products based on category
            if (category && category !== 'all') {
                filteredProducts = filteredProducts.filter((p) => p.category === category);
            }

            // Filter products based on price range
            if (priceRange) {
                filteredProducts = filteredProducts.filter(
                    (p: { price: number }) => p.price >= priceRange[0] && p.price <= priceRange[1]
                );
            }

            // Sort products based on criteria
            if (sortBy) {
                filteredProducts.sort((a, b) => {
                    switch (sortBy) {
                        case 'price-low':
                            return a.price - b.price;
                        case 'price-high':
                            return b.price - a.price;
                        case 'rating':
                            return (b.rating ?? 0) - (a.rating ?? 0);
                        default:
                            return 0;
                    }
                });
            }

            // Return all filtered and sorted products
            return filteredProducts;
        },
        staleTime: 60000, // Cache data for 60 seconds
    });

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

  console.log("data from sanity: ", data)

  if (!data || !data.some((product) => data.length > 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">No products found</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((product) =>(
            <ProductCard key={product._id} product={product} />
          )
        )}
      </div>
    </div>
  );
}