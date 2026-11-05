"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useFetchTitles from "@/hooks/shop/use-fetch-titles";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/product-card";
import { ShopCart } from "@/components/shop/shop-cart";
import { useI18n } from "@/components/i18n-provider";
import useFetchProducts from "@/hooks/shop/use-fetch-products";
import type { MessageKey } from "@/lib/i18n";

const categoryLabels: Record<string, MessageKey> = {
  clothing: "shop.clothing",
  figures: "shop.figures",
  accessories: "shop.accessories",
  manga: "shop.mangaBooks",
  home: "shop.homeDecor",
  collectibles: "shop.collectibles",
};

export default function ProductsPage() {
  return <Suspense><ProductCatalog /></Suspense>;
}

const normalize = (value: string) => value.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-");

function ProductCatalog() {
  const { t } = useI18n();
  const { products = [], isLoading, isError, refetch } = useFetchProducts({ category: "all" });
  const params = useSearchParams();
  const { titles = [] } = useFetchTitles();
  const category = params.get("category") || null;
  const anime = params.get("anime") || "";
  const search = params.get("q") || "";
  const validPrice = (value: string | null) => value && Number.isFinite(Number(value)) && Number(value) >= 0 ? value : "";
  const minPrice = validPrice(params.get("minPrice"));
  const maxPrice = validPrice(params.get("maxPrice"));
  const inStock = params.get("inStock") === "true";
  const requestedSort = params.get("sort") || "newest";
  const sort = ["newest", "price-low", "price-high", "rating"].includes(requestedSort) ? requestedSort : "newest";
  const updateFilter = (key: string, value: string, replace = false) => {
    const next = new URLSearchParams(window.location.search);
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ""}`;
    // Next.js synchronizes native history changes with useSearchParams.
    if (replace) window.history.replaceState(null, "", url);
    else window.history.pushState(null, "", url);
  };
  const resetFilters = () => {
    const next = new URLSearchParams(window.location.search);
    ["category", "anime", "q", "minPrice", "maxPrice", "inStock", "sort"].forEach(key => next.delete(key));
    window.history.pushState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
  };
  const categories = Array.from(new Set([
    ...products.map(product => product.category).filter(Boolean),
    ...(category && !products.some(product => normalize(product.category) === normalize(category)) ? [category] : []),
  ])).sort();
  const animeOptions = Array.from(new Set([
    ...titles.map(title => title.name),
    ...products.map(product => product.title?.name).filter(Boolean),
    ...(anime ? [anime] : []),
  ])).sort();
  const filteredProducts = products.filter(product =>
    (category === null || normalize(product.category) === normalize(category)) &&
    (!anime || normalize(product.title?.name || "") === normalize(anime)) &&
    product.name.toLowerCase().includes(search.trim().toLowerCase()) &&
    (minPrice === "" || product.price >= Number(minPrice)) &&
    (maxPrice === "" || product.price <= Number(maxPrice)) &&
    (!inStock || product.stock > 0)
  ).sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  return (
    <div className="min-h-screen min-w-0 pb-8">
      <ShopCart />
      <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4">
        <Button asChild variant="ghost" className="mb-4 gap-2">
          <Link href="/shop"><ArrowLeft className="h-4 w-4" />{t("nav.shop")}</Link>
        </Button>
        <h1 className="theme-outline-heading mb-6 break-words text-3xl font-bold leading-none tracking-tighter sm:text-6xl">
          {t("shop.allProducts")}
        </h1>
        <nav aria-label={t("common.categories")} className="mb-8 flex flex-wrap gap-2">
          <Button variant={category === null ? "default" : "outline"} aria-pressed={category === null} onClick={() => updateFilter("category", "")}>
            {t("shop.allProducts")}
          </Button>
          {categories.map(value => (
            <Button key={value} className="h-auto min-h-11 max-w-full whitespace-normal break-words" variant={category !== null && normalize(category) === normalize(value) ? "default" : "outline"} aria-pressed={category !== null && normalize(category) === normalize(value)} onClick={() => updateFilter("category", value)}>
              {categoryLabels[value] ? t(categoryLabels[value]) : value}
            </Button>
          ))}
        </nav>
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-lg border bg-card p-4">
            <details open>
              <summary className="flex cursor-pointer items-center gap-2 font-semibold">
                <SlidersHorizontal className="h-4 w-4" />{t("shop.filters")}
              </summary>
              <div className="mt-5 space-y-5">
                <div className="space-y-2">
                  <label htmlFor="product-search" className="text-sm font-medium">{t("shop.searchProducts")}</label>
                  <Input id="product-search" type="search" value={search} onChange={event => updateFilter("q", event.target.value, true)} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="anime-filter" className="text-sm font-medium">{t("nav.anime")}</label>
                  <select id="anime-filter" value={anime} onChange={event => updateFilter("anime", event.target.value)} className="min-h-11 w-full min-w-0 rounded-md border bg-background px-3 py-2 text-sm">
                    <option value="">{t("shop.allAnime")}</option>
                    {animeOptions.map(value => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
                <fieldset className="space-y-3">
                  <legend className="mb-2 font-medium">{t("shop.priceRange")}</legend>
                  <label className="block space-y-2 text-sm" htmlFor="min-price">
                    <span>{t("shop.minPrice")}</span>
                    <Input id="min-price" type="number" min="0" value={minPrice} onChange={event => updateFilter("minPrice", event.target.value, true)} />
                  </label>
                  <label className="block space-y-2 text-sm" htmlFor="max-price">
                    <span>{t("shop.maxPrice")}</span>
                    <Input id="max-price" type="number" min="0" value={maxPrice} onChange={event => updateFilter("maxPrice", event.target.value, true)} />
                  </label>
                </fieldset>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={inStock} onChange={event => updateFilter("inStock", event.target.checked ? "true" : "")} className="h-4 w-4 accent-primary" />
                  {t("shop.inStock")}
                </label>
                <Button variant="outline" className="w-full" onClick={resetFilters}>{t("shop.clearFilters")}</Button>
              </div>
            </details>
          </aside>
          <section aria-label={t("shop.products")} className="min-w-0" aria-busy={isLoading}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <p role="status" className="text-sm text-muted-foreground">{isLoading ? t("common.loading") : t("shop.resultCount", { count: filteredProducts.length })}</p>
              <label className="flex max-w-full flex-wrap items-center gap-2 text-sm">
                {t("common.sortBy")}
                <select value={sort} onChange={event => updateFilter("sort", event.target.value === "newest" ? "" : event.target.value)} className="min-h-11 max-w-full rounded-md border bg-background px-3 py-2">
                  <option value="newest">{t("shop.newest")}</option>
                  <option value="price-low">{t("shop.priceLow")}</option>
                  <option value="price-high">{t("shop.priceHigh")}</option>
                  <option value="rating">{t("shop.highestRated")}</option>
                </select>
              </label>
            </div>
            {isError ? (
              <div role="alert" className="space-y-4 rounded-lg border p-6 text-center">
                <p>{t("shop.loadError")}</p>
                <Button onClick={() => refetch()}>{t("shop.retry")}</Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-muted" />)}
              </div>
            ) : filteredProducts.length ? (
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {filteredProducts.map(product => <ProductCard key={product._id} product={product} />)}
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-8 text-center">
                <p>{t("common.noProducts")}</p>
                <Button variant="outline" onClick={resetFilters}>{t("shop.clearFilters")}</Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
