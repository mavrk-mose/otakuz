"use client"

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from "@/types/shop";
import { urlFor } from "@/lib/sanity";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
      <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="h-full"
      >
        <Card className="overflow-hidden h-full flex flex-col">
          <Link href={`/shop/product/${product._id}`}>
            <div className="relative aspect-square">
              <Image
                  src={urlFor(product?.image[0].asset._ref).url()}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {product.stock < 5 && (
                  <Badge
                      className="absolute top-2 right-2 text-xs sm:text-sm"
                      variant="destructive"
                  >
                    Low Stock
                  </Badge>
              )}
            </div>
          </Link>
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
              <Badge
                  variant="secondary"
                  className="ml-auto text-xs sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                {product.category}
              </Badge>
            </div>
            <Link
                href={`/shop/product/${product._id}`}
                className="font-semibold hover:text-primary transition-colors line-clamp-1 text-sm sm:text-base"
            >
              {product.name}
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4 line-clamp-2 flex-grow">
              {product.description}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:justify-between mt-auto">
              <span className="text-base sm:text-lg font-bold">Tshs.{product.price}</span>
              <Button
                  size="sm"
                  onClick={() => addToCart(product)}
                  className="w-full sm:w-auto text-xs sm:text-sm py-1.5 sm:py-2"
              >
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
  );
}