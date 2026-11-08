"use client";

import Link from "next/link";
import { ShopCart } from "@/components/shop/shop-cart";
import { ProductList } from "@/components/shop/product-list";
import { CategoryList } from "@/components/shop/category-list";
import { ShowBanner } from "@/components/shop/show-banner";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import TitleBanner from "@/components/shop/title-banner";
import { useI18n } from "@/components/i18n-provider";
import { GoogleAdUnit } from "@/components/ads/google-ad-unit";

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

  return (
    <div className="min-h-screen min-w-0 pb-4">
      <ShopCart />
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="theme-outline-heading mb-8 break-words text-3xl font-bold leading-none tracking-tighter sm:text-6xl">
            {t("shop.newArrivals")}
          </h2>

          <ProductList category="all" limit={4} />

          <div className="mt-10">
            <GoogleAdUnit
              context="shop"
              variant="spotlight"
              adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHOP_TOP}
            />
          </div>
        </div>
      </section>

      {/* Shop By Title */}
      <section className="py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="theme-outline-heading mb-8 break-words text-3xl font-bold leading-none tracking-tighter sm:text-6xl">
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
          <h2 className="theme-outline-heading mb-8 break-words text-3xl font-bold leading-none tracking-tighter sm:text-6xl">
            {t("shop.shopByCategory")}
          </h2>
          <CategoryList />

          <div className="mt-12">
            <GoogleAdUnit
              context="shop"
              variant="in-feed-grid"
              adFormat="fluid"
              seedOffset={3}
              adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_SHOP_FEED}
            />
          </div>
        </div>
      </section>

      {/* All Products */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="theme-outline-heading min-w-0 break-words text-3xl font-bold leading-none tracking-tighter sm:text-6xl">
              {t("shop.allProducts")}
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/shop/products" className="gap-2">
                {t("common.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <ProductList category="all" limit={8} />
        </div>
      </section>
    </div>
  );
}
