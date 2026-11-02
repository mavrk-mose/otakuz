"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import useFetchProduct from "@/hooks/shop/use-fetch-product";
import {
  formatShopPrice,
  resolveAllProductImages,
  resolveProductImage,
} from "@/lib/shop-utils";
import { useCart } from "@/store/use-cart";
import { useI18n } from "@/components/i18n-provider";
import { ShareContentModal } from "@/components/chat/share-content-modal";
import { CartDrawer } from "@/components/shop/cart-drawer";

interface Props {
  params: Promise<{ id: string }>;
}

const DEFAULT_APPAREL_SIZES = ["SM", "M", "L", "XL", "2XL"];

export default function ProductPage(props: Props) {
  const { t } = useI18n();
  const params = use(props.params);
  const { product, isLoading } = useFetchProduct(params.id);
  const { addToCart, totalItems } = useCart();

  const [selectedSize, setSelectedSize] = useState<string>("");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="aspect-square rounded-2xl bg-muted lg:col-span-2" />
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded bg-muted" />
              <div className="h-6 w-1/3 rounded bg-muted" />
              <div className="h-32 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="mb-4 text-lg font-semibold">{t("shop.productNotFound")}</p>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const images = resolveAllProductImages(product);
  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : product.category?.toLowerCase() === "apparel"
        ? DEFAULT_APPAREL_SIZES
        : [];
  const requiresSize = availableSizes.length > 0;
  const outOfStock = product.stock <= 0;
  const formattedPrice = formatShopPrice(
    product.price,
    product.currency || "USD"
  );

  const handleAddToCart = () => {
    if (requiresSize && !selectedSize) {
      toast.error("Please select a size first.");
      return;
    }
    addToCart(product, selectedSize || undefined, 1);
    toast.success(`Added "${product.name}" to your cart`);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCartOpen(true)}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {t("shop.cart")} ({totalItems})
          </Button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Product Gallery */}
          <div className="lg:w-3/5">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {images.map((imgUrl, index) => (
                  <Card
                    key={`${imgUrl}-${index}`}
                    className={`overflow-hidden border-border/80 bg-card ${
                      index === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={imgUrl}
                        alt={`${product.name} - View ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Sticky Product Info & Stripe Payment Card */}
          <div className="lg:w-2/5">
            <div className="sticky top-20 space-y-6 rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{product.category}</Badge>
                  {product.animeTitle && (
                    <Badge variant="outline">{product.animeTitle}</Badge>
                  )}
                  <Badge
                    variant={outOfStock ? "destructive" : "outline"}
                    className="ml-auto"
                  >
                    {outOfStock
                      ? "Out of Stock"
                      : `${product.stock} in stock`}
                  </Badge>
                </div>

                <h1 className="mb-2 text-2xl font-black tracking-tight sm:text-3xl">
                  {product.name}
                </h1>

                {product.shopName && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Store className="h-4 w-4 text-rose-500" />
                    <span>Sold by</span>
                    {product.shopSlug ? (
                      <Link
                        href={`/shop/store/${product.shopSlug}`}
                        className="font-semibold text-foreground underline-offset-4 hover:text-rose-500 hover:underline"
                      >
                        {product.shopName}
                      </Link>
                    ) : (
                      <span className="font-semibold text-foreground">
                        {product.shopName}
                      </span>
                    )}
                    {product.stripeChargesEnabled && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400"
                      >
                        <ShieldCheck className="h-3 w-3" />
                        Verified Stripe Seller
                      </Badge>
                    )}
                  </div>
                )}

                <div className="mb-4 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (product.rating || 5)
                            ? "fill-current text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    ({Number(product.rating || 5).toFixed(1)})
                  </span>
                </div>

                <div className="text-3xl font-black text-rose-500">
                  {formattedPrice}
                </div>
              </div>

              {requiresSize && (
                <div className="space-y-2.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {t("shop.size")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSizes.map((size) => (
                      <Button
                        key={size}
                        type="button"
                        variant={selectedSize === size ? "default" : "outline"}
                        className={
                          selectedSize === size
                            ? "bg-rose-500 text-white hover:bg-rose-600"
                            : "hover:border-foreground"
                        }
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2.5">
                <Button
                  size="lg"
                  className="w-full gap-2 bg-rose-500 font-semibold text-white hover:bg-rose-600"
                  onClick={handleAddToCart}
                  disabled={outOfStock || (requiresSize && !selectedSize)}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {outOfStock ? "Sold Out" : t("shop.addToCart")}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2 border-border hover:bg-muted"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <Share2 className="h-4 w-4" />
                  {t("anime.shareChat") || "Share to Chat"}
                </Button>
              </div>

              {/* Accepted Payment Options Info */}
              <div className="rounded-xl border border-border/70 bg-background/60 p-3.5 text-xs">
                <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-foreground">
                  <CreditCard className="h-3.5 w-3.5 text-rose-500" />
                  <span>Stripe Checkout Payment Options</span>
                </div>
                <p className="text-muted-foreground">
                  Pay securely with Visa, Mastercard, Amex
                  {(product.acceptedPaymentMethods ?? ["apple_google_pay"]).includes(
                    "apple_google_pay"
                  )
                    ? ", Apple Pay, Google Pay"
                    : ""}
                  {(product.acceptedPaymentMethods ?? ["link"]).includes("link")
                    ? ", Stripe Link"
                    : ""}
                  {product.acceptedPaymentMethods?.includes("klarna")
                    ? ", or Klarna installments"
                    : ""}
                  .
                </p>
              </div>

              {/* Description */}
              <div className="border-t border-border/80 pt-4">
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left"
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                >
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {t("shop.description")}
                  </span>
                  {isDescriptionOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                <AnimatePresence>
                  {isDescriptionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="py-3 text-sm leading-relaxed text-muted-foreground">
                        <p>{product.description}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      <ShareContentModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        payload={{
          type: "product",
          data: {
            id: params.id,
            name: product.name,
            image: resolveProductImage(product, 0),
            price: product.price,
            category: product.category,
            rating: product.rating,
            stock: product.stock,
            description: product.description,
          },
        }}
      />
    </div>
  );
}
