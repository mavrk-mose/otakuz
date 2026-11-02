"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Share2, Store, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { Product } from "@/types/shop";
import { formatShopPrice, resolveProductImage } from "@/lib/shop-utils";
import { useCart } from "@/store/use-cart";
import { useI18n } from "@/components/i18n-provider";
import { ShareContentModal } from "@/components/chat/share-content-modal";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useI18n();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const primaryImage = resolveProductImage(product, 0);
  const formattedPrice = formatShopPrice(
    product.price,
    product.currency || "USD"
  );
  const outOfStock = product.stock <= 0;

  const handleQuickAdd = () => {
    const defaultSize =
      product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined;
    addToCart(product, defaultSize, 1);
    toast.success(`Added "${product.name}" to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden border-border/80 bg-card transition-colors hover:border-rose-500/40">
        <Link href={`/shop/product/${product._id}`}>
          <div className="relative aspect-square overflow-hidden bg-muted/40">
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {outOfStock ? (
              <Badge
                className="absolute right-2 top-2 text-xs"
                variant="destructive"
              >
                Sold Out
              </Badge>
            ) : product.stock < 5 ? (
              <Badge
                className="absolute right-2 top-2 text-xs"
                variant="destructive"
              >
                {t("shop.lowStock")}
              </Badge>
            ) : null}

            {product.source === "community" && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full border border-border/70 bg-background/90 px-2.5 py-0.5 text-[11px] font-medium text-foreground backdrop-blur">
                <Store className="h-3 w-3 text-rose-500" />
                <span className="max-w-[130px] truncate">
                  {product.shopName || "Creator Shop"}
                </span>
                {product.stripeChargesEnabled && (
                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                )}
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-grow flex-col p-3.5 sm:p-4">
          <div className="mb-1.5 flex items-center gap-1.5 sm:mb-2">
            <Star className="h-3.5 w-3.5 fill-current text-amber-400" />
            <span className="text-xs font-medium text-foreground">
              {Number(product.rating || 5).toFixed(1)}
            </span>
            <Badge
              variant="secondary"
              className="ml-auto px-2 py-0.5 text-[11px]"
            >
              {product.category}
            </Badge>
          </div>

          <Link
            href={`/shop/product/${product._id}`}
            className="line-clamp-1 text-sm font-semibold text-foreground transition-colors hover:text-rose-500 sm:text-base"
          >
            {product.name}
          </Link>

          {product.shopSlug ? (
            <Link
              href={`/shop/store/${product.shopSlug}`}
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-rose-500"
            >
              <span>by {product.shopName}</span>
            </Link>
          ) : null}

          <p className="mb-3 mt-1.5 line-clamp-2 flex-grow text-xs text-muted-foreground sm:mb-4">
            {product.description}
          </p>

          <div className="mt-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-base font-bold text-foreground sm:text-lg">
              {formattedPrice}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsShareModalOpen(true)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                title="Share to chat"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                disabled={outOfStock}
                onClick={handleQuickAdd}
                className="w-full bg-rose-500 text-xs font-semibold text-white hover:bg-rose-600 sm:w-auto"
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                {outOfStock ? "Sold Out" : t("shop.addToCart")}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <ShareContentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        payload={{
          type: "product",
          data: {
            id: product._id,
            name: product.name,
            image: primaryImage,
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
