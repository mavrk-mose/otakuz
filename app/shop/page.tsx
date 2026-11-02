"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Store,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductList } from "@/components/shop/product-list";
import { CategoryList } from "@/components/shop/category-list";
import { ShowBanner } from "@/components/shop/show-banner";
import TitleBanner from "@/components/shop/title-banner";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCart } from "@/store/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/components/i18n-provider";
import {
  useMySellerShop,
  usePublicShops,
} from "@/hooks/shop/use-marketplace";

const featuredBanners = [
  {
    title: "Demon Slayer",
    subtitle: "New Collection",
    image:
      "https://www.pixelstalk.net/wp-content/uploads/images6/Demon-Slayer-HD-Wallpaper-4K-Free-download-620x388.jpg",
    color: "from-red-500/20",
  },
  {
    title: "Chainsaw Man",
    subtitle: "Limited Edition",
    image:
      "https://www.themarysue.com/wp-content/uploads/2023/09/chainsaw-man-power-denji.jpg.webp?w=1200",
    color: "from-orange-500/20",
  },
];

export default function ShopPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [selectedCategory] = useState<string>("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();

  const { data: myShop } = useMySellerShop(user?.uid);
  const { data: creatorShops = [] } = usePublicShops(12);

  return (
    <div className="min-h-screen space-y-6 pb-8">
      {/* Top Marketplace Action Bar & Creator Shop Signup Banner */}
      <section className="pt-2">
        <div className="container mx-auto max-w-7xl px-4">
          <Card className="relative overflow-hidden border-border/80 bg-card p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-500">
                  <Sparkles className="h-3.5 w-3.5" />
                  Otakuz Multi-Vendor Merch Marketplace • Powered by Stripe
                </div>
                <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {myShop
                    ? `Welcome back, ${myShop.shopName}`
                    : "Launch Your Own Anime & Manga Merch Shop"}
                </h1>
                <p className="text-xs text-muted-foreground sm:text-sm">
                  {myShop
                    ? "Manage your merch inventory, customize accepted Stripe payment options, and track payouts in your Seller Studio."
                    : "Sign up as an Otakuz creator to open your custom storefront, list figures, apparel & prints, set your payment options, and get paid directly via Stripe Connect."}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  asChild
                  className="gap-2 bg-rose-500 font-semibold text-white hover:bg-rose-600"
                >
                  <Link href="/shop/seller">
                    <Store className="h-4 w-4" />
                    {myShop ? "Seller Studio" : "Open Your Shop"}
                  </Link>
                </Button>

                <Button variant="outline" asChild className="gap-2">
                  <Link href="/shop/orders">
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsCartOpen(true)}
                  className="gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {t("shop.cart")} ({totalItems})
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Community Creator Shops Showcase */}
      {creatorShops.length > 0 && (
        <section className="py-4">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500">
                  Verified Storefronts
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  Community Creator Shops
                </h2>
              </div>
              <Button variant="ghost" size="sm" asChild className="gap-1.5">
                <Link href="/shop/seller">
                  {myShop ? "Manage My Shop" : "Become a Seller"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-3">
              {creatorShops.map((shop) => (
                <Link
                  key={shop.ownerId}
                  href={`/shop/store/${shop.slug}`}
                  className="group w-72 shrink-0"
                >
                  <Card className="h-full overflow-hidden border-border/80 bg-card p-4 transition hover:-translate-y-0.5 hover:border-rose-500/40">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
                        {shop.logoUrl ? (
                          <Image
                            src={shop.logoUrl}
                            alt={shop.shopName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Store className="h-5 w-5 text-rose-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="truncate text-sm font-bold text-foreground group-hover:text-rose-500">
                            {shop.shopName}
                          </h3>
                          {shop.stripeChargesEnabled && (
                            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          /shop/store/{shop.slug}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {shop.currency}
                      </Badge>
                    </div>
                    {shop.tagline && (
                      <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                        {shop.tagline}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CreditCard className="h-3 w-3 text-rose-500" />
                      <span>Stripe Checkout Ready</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals (Unified Creator Merch + Official Sanity Catalog) */}
      <section className="py-4">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="theme-outline-heading text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
              {t("shop.newArrivals")}
            </h2>
          </div>

          <ProductList category={selectedCategory} limit={8} />
        </div>
      </section>

      {/* Shop By Title */}
      <section className="py-4">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="theme-outline-heading mb-8 text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
            {t("shop.shopByTitle")}
          </h2>
          <TitleBanner />
        </div>
      </section>

      {/* Show Banners */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredBanners.map((banner, idx) => (
              <ShowBanner key={idx} {...banner} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="theme-outline-heading mb-8 text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
            {t("shop.shopByCategory")}
          </h2>
          <CategoryList />
        </div>
      </section>

      {/* All Products */}
      <section className="py-8">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="theme-outline-heading text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
              {t("shop.allProducts")}
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/shop/filter/all" className="gap-2">
                {t("common.viewAll")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <ProductList category="all" limit={12} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
