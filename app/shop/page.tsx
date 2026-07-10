"use client";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { ProductList } from "@/components/shop/product-list";
import { CategoryList } from "@/components/shop/category-list";
import { ShowBanner } from "@/components/shop/show-banner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from 'lucide-react';
import TitleBanner from "@/components/shop/title-banner";
import { useCart } from "@/store/use-cart";
import { useState } from "react";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useI18n } from "@/components/i18n-provider";

//TODO: fetch from sanity
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
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart(); 

  return (
    <div className="min-h-screen pb-4">
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="theme-outline-heading mb-8 text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
              {t("shop.newArrivals")}
            </h2>
            <Button variant="outline" className="mt-4 md:mt-0" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="h-4 w-4" />
              {t("shop.cart")} ({totalItems})
            </Button>
          </div>
          
          <ProductList category={selectedCategory} limit={4} />
        </div>

      </section>

      {/* Shop By Title */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="theme-outline-heading mb-8 text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
            {t("shop.shopByTitle")}
          </h2>
          <TitleBanner />
        </div>
      </section>

      {/* Show Banners */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredBanners.map((banner, idx) => (
              <ShowBanner key={idx} {...banner} />
            ))}
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="theme-outline-heading mb-8 text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
            {t("shop.shopByCategory")}
          </h2>
          <CategoryList />
        </div>
      </section>

      {/* All Products */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <h2 className="theme-outline-heading mb-8 text-4xl font-bold leading-none tracking-tighter sm:text-6xl">
              {t("shop.allProducts")}
              </h2>
            <Button variant="ghost" asChild>
              <Link href="/anime" className="gap-2">
                {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <ScrollArea className="w-full whitespace-nowrap">
            <ProductList category="all" limit={8} />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </section>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}
