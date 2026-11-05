"use client"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from "@/types/shop";
import { urlFor } from "@/lib/sanity";
import { animateToCart } from '@/lib/animate-to-cart';
import { useCart } from '@/store/use-cart';
import { useI18n } from '@/components/i18n-provider';
import { ShareContentModal } from '@/components/chat/share-content-modal';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useI18n();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
      <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="h-full min-w-0"
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
                    {t("shop.lowStock")}
                  </Badge>
              )}
            </div>
          </Link>
          <div className="p-3 sm:p-4 flex flex-col flex-grow">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-current" />
              <span className="text-xs sm:text-sm font-medium">{product.rating}</span>
              <Badge
                  variant="secondary"
                  className="ml-auto max-w-full break-words whitespace-normal text-xs sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1"
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
            <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
              <span className="min-w-0 break-all text-base sm:text-lg font-bold">Tshs.{product.price}</span>
              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                    size="icon"
                    variant="outline"
                    onClick={() => setIsShareModalOpen(true)}
                    className="h-11 w-11 shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Share to chat"
                    title="Share to chat"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                    size="icon"
                    onClick={(event) => {
                      addToCart(product);
                      animateToCart(event.currentTarget);
                    }}
                    className="h-11 w-11 shrink-0"
                    aria-label={`${t("shop.addToCart")}: ${product.name}`}
                    title={t("shop.addToCart")}
                >
                  <ShoppingCart className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <ShareContentModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            payload={{
                type: 'product',
                data: {
                    id: product._id,
                    name: product.name,
                    image: product.image?.[0] ? urlFor(product.image[0].asset._ref).url() : '',
                    price: product.price,
                    category: product.category,
                    rating: product.rating,
                    stock: product.stock,
                    description: product.description,
                },
            }}
        />
      </motion.div>
  );
}
