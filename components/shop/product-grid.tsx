"use client"

import { useInfiniteQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Product } from '@/types/shop';

interface ProductGridProps {
  category: string;
  sortBy: string;
}

export function ProductGrid({ category, sortBy }: ProductGridProps) {
  const { ref, inView } = useInView();
  const { addToCart } = useCart();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['products', category, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      // This would be replaced with your actual API call
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Naruto T-Shirt',
          description: 'Official Naruto Shippuden merchandise',
          price: 24.99,
          image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=2074&auto=format&fit=crop',
          category: 'clothing',
          rating: 4.5,
          stock: 50
        },
        {
          id: '2',
          name: 'One Piece Figure',
          description: 'Collectible Luffy action figure',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=2080&auto=format&fit=crop',
          category: 'figures',
          rating: 5,
          stock: 15
        },
        {
          id: '3',
          name: 'Japan Souvenir',
          description: 'Shrine',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1625189659340-887baac3ea32?q=80&w=3473&auto=format&fit=crop',
          category: 'collectibles',
          rating: 5,
          stock: 15
        },
        {
          id: '4',
          name: 'One Piece Figure',
          description: 'Shrine',
          price: 59.99,
          image: 'https://images.unsplash.com/photo-1708034677699-6f39d9c59f6e?q=80&w=3387&auto=format&fit=crop',
          category: 'figures',
          rating: 5,
          stock: 15
        }
      ];
      return { data: mockProducts, nextPage: pageParam + 1, hasMore: false };
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    initialPageParam: 1
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {data?.pages.map((page) =>
        page.data.map((product) => (
          <motion.div key={product.id} variants={item}>
            <Card className="overflow-hidden group">
              <Link href={`/shop/products/${product.id}`}>
                <div className="relative aspect-square">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {product.stock < 20 && (
                    <Badge className="absolute top-2 right-2" variant="destructive">
                      Low Stock
                    </Badge>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {product.category}
                  </Badge>
                </div>
                <Link
                  href={`/shop/products/${product.id}`}
                  className="font-semibold hover:text-primary transition-colors line-clamp-1"
                >
                  {product.name}
                </Link>
                <p className="text-sm text-muted-foreground mt-1 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${product.price}</span>
                  <Button size="sm" onClick={() => addToCart(product)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}

      <div ref={ref} className="col-span-full flex justify-center mt-8">
        {hasNextPage && (
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        )}
      </div>
    </motion.div>
  );
}