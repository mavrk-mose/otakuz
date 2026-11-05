"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import useFetchTitles from "@/hooks/shop/use-fetch-titles";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";
import { Slider } from "@/components/ui/slider";
import { ProductCardSkeleton } from "@/components/shop/product-card-skeleton";
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
  const { titles = [], isLoading: titlesLoading } = useFetchTitles();
  const [showAllAnime, setShowAllAnime] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const prices = products.map(product => product.price).filter(Number.isFinite);
  const lowestPrice = prices.length ? Math.min(...prices) : 0;
  const highestPrice = prices.length ? Math.max(...prices) : 0;
  const clampPrice = (price: number) => Math.min(highestPrice, Math.max(lowestPrice, price));
  const priceRange = [
    clampPrice(minPrice === "" ? lowestPrice : Number(minPrice)),
    clampPrice(maxPrice === "" ? highestPrice : Number(maxPrice)),
  ].sort((a, b) => a - b);
  const updatePriceRange = ([min, max]: number[]) => {
    const next = new URLSearchParams(window.location.search);
    if (min === lowestPrice) next.delete("minPrice");
    else next.set("minPrice", String(min));
    if (max === highestPrice) next.delete("maxPrice");
    else next.set("maxPrice", String(max));
    window.history.replaceState(null, "", `${window.location.pathname}${next.size ? `?${next}` : ""}`);
  };
  const animePreviews = animeOptions.slice(0, 4);
  if (anime && !animePreviews.includes(anime)) animePreviews.push(anime);
  const visibleAnime = showAllAnime ? animeOptions : animePreviews;
  const filteredProducts = products.filter(product =>
    (category === null || normalize(product.category) === normalize(category)) &&
    (!anime || normalize(product.title?.name || "") === normalize(anime)) &&
    product.name.toLowerCase().includes(search.trim().toLowerCase()) &&
    product.price >= priceRange[0] && product.price <= priceRange[1] &&
    (!inStock || product.stock > 0)
  ).sort((a, b) => {
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "rating") return (b.rating ?? 0) - (a.rating ?? 0);
    return 0;
  });

  return (
    <div className="min-h-screen min-w-0 pb-8">
      <ShopCart>
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <Button asChild variant="ghost" className="h-10 shrink-0 gap-2 px-2">
            <Link href="/shop"><ArrowLeft className="h-4 w-4" /><span>{t("nav.shop")}</span></Link>
          </Button>
          <h1 className="theme-outline-heading min-w-0 break-words text-2xl font-bold leading-tight tracking-tighter sm:text-4xl">
            {t("shop.allProducts")}
          </h1>
        </div>
      </ShopCart>
      <div className="mx-auto max-w-7xl px-2 pt-3 sm:px-4 sm:pt-4">
        <nav aria-label={t("common.categories")} className="mb-4 flex flex-wrap gap-2 sm:mb-5">
          <Button variant={category === null ? "default" : "outline"} aria-pressed={category === null} onClick={() => updateFilter("category", "")}>
            {t("shop.allProducts")}
          </Button>
          {isLoading && Array.from({ length: 3 }, (_, index) => <div key={`category-${index}`} aria-hidden="true" className="h-11 w-24 animate-pulse rounded-md bg-muted motion-reduce:animate-none" />)}
          {categories.map(value => (
            <Button key={value} className="h-auto min-h-11 max-w-full whitespace-normal break-words" variant={category !== null && normalize(category) === normalize(value) ? "default" : "outline"} aria-pressed={category !== null && normalize(category) === normalize(value)} onClick={() => updateFilter("category", value)}>
              {categoryLabels[value] ? t(categoryLabels[value]) : value}
            </Button>
          ))}
        </nav>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
        <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-lg border bg-card p-4">
              <h2 className="hidden items-center gap-2 font-semibold lg:flex"><SlidersHorizontal className="h-4 w-4" />{t("shop.filters")}</h2>
              <button type="button" className="flex min-h-11 w-full items-center justify-between gap-2 text-left font-semibold lg:hidden" aria-expanded={filtersOpen} aria-controls="catalog-filters" onClick={() => setFiltersOpen(open => !open)}>
                <span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />{t("shop.filters")}</span>
                <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
              </button>
              <div id="catalog-filters" className={`${filtersOpen ? "block" : "hidden"} mt-4 space-y-5 lg:block`}>
                <div className="space-y-2">
                  <label htmlFor="product-search" className="text-sm font-medium">{t("shop.searchProducts")}</label>
                  <Input id="product-search" type="search" value={search} onChange={event => updateFilter("q", event.target.value, true)} />
                </div>
                <fieldset className="space-y-3">
                  <legend className="mb-2 text-sm font-medium">{t("nav.anime")}</legend>
                  <Button variant={!anime ? "default" : "outline"} className="w-full" aria-pressed={!anime} onClick={() => updateFilter("anime", "")}>{t("shop.allAnime")}</Button>
                  {titlesLoading && !animeOptions.length ? (
                    <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                      {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex animate-pulse flex-col items-center gap-2 rounded-md border p-2 motion-reduce:animate-none"><div className="h-12 w-12 rounded-full bg-muted" /><div className="h-8 w-full rounded bg-muted" /></div>)}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2" id="anime-options">
                      {visibleAnime.map(value => {
                        const title = titles.find(title => normalize(title.name) === normalize(value)) || products.find(product => normalize(product.title?.name || "") === normalize(value))?.title;
                        const imageRef = title?.image?.asset?._ref;
                        const selected = normalize(anime) === normalize(value);
                        return (
                          <button key={value} type="button" aria-pressed={selected} onClick={() => updateFilter("anime", selected ? "" : value)} className={`flex min-w-0 flex-col items-center gap-2 rounded-md border p-2 text-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-accent"}`}>
                            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold" aria-hidden="true">
                              {imageRef ? <Image src={urlFor(imageRef).width(96).height(96).url()} alt="" fill sizes="48px" className="object-cover" /> : value.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="min-h-8 break-words">{value}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {animeOptions.length > 4 && <Button variant="ghost" className="w-full" aria-expanded={showAllAnime} aria-controls="anime-options" onClick={() => setShowAllAnime(value => !value)}>{t(showAllAnime ? "shop.showLess" : "shop.showAllAnime")}</Button>}
                </fieldset>
                <fieldset className="space-y-3">
                  <legend className="mb-2 font-medium">{t("shop.priceRange")}</legend>
                  {isLoading ? <div aria-hidden="true" className="h-12 animate-pulse rounded bg-muted motion-reduce:animate-none" /> : <>
                    <Slider min={lowestPrice} max={highestPrice > lowestPrice ? highestPrice : lowestPrice + 1} step={0.01} value={priceRange} onValueChange={updatePriceRange} disabled={!prices.length || lowestPrice === highestPrice} thumbLabels={[t("shop.minPrice"), t("shop.maxPrice")]} className="py-3" />
                    <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                      <span>Tshs. {priceRange[0].toLocaleString()}</span>
                      <span>Tshs. {priceRange[1].toLocaleString()}</span>
                    </div>
                  </>}
                </fieldset>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={inStock} onChange={event => updateFilter("inStock", event.target.checked ? "true" : "")} className="h-4 w-4 accent-primary" />
                  {t("shop.inStock")}
                </label>
                <Button variant="outline" className="w-full" onClick={resetFilters}>{t("shop.clearFilters")}</Button>
              </div>
          </aside>
          <section aria-label={t("shop.products")} className="min-w-0" aria-busy={isLoading}>

            {isError ? (
              <div role="alert" className="space-y-4 rounded-lg border p-6 text-center">
                <p>{t("shop.loadError")}</p>
                <Button onClick={() => refetch()}>{t("shop.retry")}</Button>
              </div>
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}
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
