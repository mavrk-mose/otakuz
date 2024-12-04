"use client"

import { Product } from '@/types/shop';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
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
  );
}