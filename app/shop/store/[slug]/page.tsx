"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/shop/product-card";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/store/use-cart";
import {
  useShopBySlug,
  useShopProductsByOwner,
} from "@/hooks/shop/use-marketplace";
import { formatShopPrice } from "@/lib/shop-utils";

interface StorefrontPageProps {
  params: Promise<{ slug: string }>;
}

export default function CreatorStorefrontPage(props: StorefrontPageProps) {
  const params = use(props.params);
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: shop, isLoading: shopLoading } = useShopBySlug(params.slug);
  const { data: products = [], isLoading: productsLoading } =
    useShopProductsByOwner(shop?.ownerId);

  if (shopLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <Store className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-black text-foreground">
          Storefront Not Found
        </h1>
        <p className="mt-1 mb-6 text-sm text-muted-foreground">
          This shop handle may not exist or is currently paused.
        </p>
        <Button asChild variant="outline">
          <Link href="/shop">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Otakuz Shop
          </Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.uid === shop.ownerId;

  return (
    <div className="min-h-screen space-y-8 pb-10">
      <div className="container mx-auto max-w-7xl px-4 pt-2">
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-1.5">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              All Shops & Merch
            </Link>
          </Button>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Button variant="outline" size="sm" asChild className="gap-1.5">
                <Link href="/shop/seller">
                  <Settings className="h-4 w-4" />
                  Manage My Shop
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart ({totalItems})
            </Button>
          </div>
        </div>

        {/* Storefront Banner & Header */}
        <Card className="overflow-hidden border-border/80 bg-card">
          <div className="relative h-44 w-full bg-gradient-to-r from-rose-500/20 via-muted to-amber-500/15 sm:h-56">
            {shop.bannerUrl && (
              <Image
                src={shop.bannerUrl}
                alt={`${shop.shopName} banner`}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="relative -mt-14 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-card bg-background shadow-md">
                  {shop.logoUrl ? (
                    <Image
                      src={shop.logoUrl}
                      alt={shop.shopName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Store className="h-9 w-9 text-rose-500" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                      {shop.shopName}
                    </h1>
                    {shop.stripeChargesEnabled && (
                      <Badge className="gap-1 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Stripe Merchant
                      </Badge>
                    )}
                    <Badge variant="outline">{shop.currency}</Badge>
                  </div>
                  {shop.tagline && (
                    <p className="mt-1 text-sm font-medium text-foreground/90">
                      {shop.tagline}
                    </p>
                  )}
                  {shop.description && (
                    <p className="mt-2 max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {shop.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5">
                  <Truck className="h-3.5 w-3.5 text-rose-500" />
                  {shop.shippingPolicy?.flatRate > 0
                    ? `Shipping: ${formatShopPrice(
                        shop.shippingPolicy.flatRate,
                        shop.currency
                      )}`
                    : "Free Shipping"}{" "}
                  • {shop.shippingPolicy?.estimatedDays || "3–7 business days"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-rose-500" />
                  Stripe Checkout
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Storefront Catalog */}
        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-foreground">
              Merch Catalog ({products.length})
            </h2>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl bg-muted"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="border-dashed border-border bg-card p-12 text-center">
              <p className="text-sm text-muted-foreground">
                This creator hasn&apos;t published any merch listings yet.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
