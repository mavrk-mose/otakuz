"use client";

import { ErrorState } from "@/components/page-state";
import { EmptyState } from "@/components/empty-state";

import { Suspense, useState } from "react";
import { shopFilterParsers } from "@/lib/query-state";
import { useQueryStates } from "nuqs";
import { useCatalogFacets } from "@/hooks/shop/use-catalog-facets";
import { normalizeCatalogValue as normalize } from "@/lib/sanity-pagination";
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
  return (
    <Suspense>
      <ProductCatalog />
    </Suspense>
  );
}

function ProductCatalog() {
  const { t } = useI18n();
  const [query, setQuery] = useQueryStates(shopFilterParsers, { history: "push", scroll: false });
  const {
    data: facets,
    isLoading: titlesLoading,
    isError: facetsError,
    refetch: refetchFacets,
  } = useCatalogFacets();
  const titles = facets?.titles ?? [];
  const [showAllAnime, setShowAllAnime] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const category = query.category || null;
  const anime = query.anime || "";
  const search = query.q || "";
  const { minPrice, maxPrice, inStock, sort } = query;
  const updateFilter = (key: keyof typeof shopFilterParsers, value: string, replace = false) => {
    void setQuery(
      { [key]: value ? shopFilterParsers[key].parse(value) : null },
      { history: replace ? "replace" : "push" },
    );
  };
  const resetFilters = () => {
    void setQuery({
      category: null,
      anime: null,
      q: null,
      minPrice: null,
      maxPrice: null,
      inStock: null,
      sort: null,
    });
  };
  const categories = facets?.categories ?? [];
  const animeOptions = titles.map((title) => title.name);
  const lowestPrice = facets?.minPrice ?? 0;
  const highestPrice = facets?.maxPrice ?? 0;
  const clampPrice = (price: number) => Math.min(highestPrice, Math.max(lowestPrice, price));
  const priceRange = [
    clampPrice(minPrice === "" ? lowestPrice : Number(minPrice)),
    clampPrice(maxPrice === "" ? highestPrice : Number(maxPrice)),
  ].sort((a, b) => a - b);
  const {
    products = [],
    total,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchProducts({
    categories: category
      ? categories
          .filter((value) => normalize(value) === normalize(category))
          .concat(
            categories.some((value) => normalize(value) === normalize(category)) ? [] : [category],
          )
      : [],
    titles: anime
      ? animeOptions
          .filter((value) => normalize(value) === normalize(anime))
          .concat(
            animeOptions.some((value) => normalize(value) === normalize(anime)) ? [] : [anime],
          )
      : [],
    search,
    minPrice: minPrice === "" && maxPrice === "" ? undefined : priceRange[0],
    maxPrice: minPrice === "" && maxPrice === "" ? undefined : priceRange[1],
    inStock,
    sort,
    enabled: !!facets,
  });
  const isLoading = titlesLoading || (!facetsError && productsLoading);
  const isError = facetsError || productsError;
  const refetch = () => {
    void refetchFacets();
    void refetchProducts();
  };
  const updatePriceRange = ([min, max]: number[]) => {
    void setQuery(
      {
        minPrice: min === lowestPrice ? null : String(min),
        maxPrice: max === highestPrice ? null : String(max),
      },
      { history: "replace" },
    );
  };
  const animePreviews = animeOptions.slice(0, 4);
  if (anime && !animePreviews.includes(anime)) animePreviews.push(anime);
  const visibleAnime = showAllAnime ? animeOptions : animePreviews;

  return (
    <div className="min-h-screen min-w-0 pb-8">
      <ShopCart>
        <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1">
          <Button asChild variant="ghost" className="h-10 shrink-0 gap-2 px-2">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              <span>{t("nav.shop")}</span>
            </Link>
          </Button>
          <h1 className="theme-outline-heading min-w-0 break-words text-2xl font-bold leading-tight tracking-tighter sm:text-4xl">
            {t("shop.allProducts")}
          </h1>
        </div>
      </ShopCart>
      <div className="mx-auto max-w-7xl px-2 pt-2 sm:px-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <nav aria-label={t("common.categories")} className="flex min-w-0 flex-wrap gap-2">
            <Button
              variant={category === null ? "default" : "outline"}
              aria-pressed={category === null}
              onClick={() => updateFilter("category", "")}
            >
              {t("shop.allProducts")}
            </Button>
            {isLoading &&
              Array.from({ length: 3 }, (_, index) => (
                <div
                  key={`category-${index}`}
                  aria-hidden="true"
                  className="h-11 w-24 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                />
              ))}
            {categories.map((value) => (
              <Button
                key={value}
                className="h-auto min-h-11 max-w-full whitespace-normal break-words"
                variant={
                  category !== null && normalize(category) === normalize(value)
                    ? "default"
                    : "outline"
                }
                aria-pressed={category !== null && normalize(category) === normalize(value)}
                onClick={() => updateFilter("category", value)}
              >
                {categoryLabels[value] ? t(categoryLabels[value]) : value}
              </Button>
            ))}
          </nav>
          <div className="flex max-w-full flex-wrap items-center gap-3">
            <p role="status" className="text-sm text-muted-foreground">
              {isLoading ? t("common.loading") : t("shop.resultCount", { count: total })}
            </p>
            <label className="flex max-w-full flex-wrap items-center gap-2 text-sm">
              {t("common.sortBy")}
              <select
                value={sort}
                onChange={(event) =>
                  updateFilter("sort", event.target.value === "newest" ? "" : event.target.value)
                }
                className="min-h-11 max-w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="newest">{t("shop.newest")}</option>
                <option value="price-low">{t("shop.priceLow")}</option>
                <option value="price-high">{t("shop.priceHigh")}</option>
                <option value="rating">{t("shop.highestRated")}</option>
              </select>
            </label>
          </div>
        </div>
        <div className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="min-w-0 rounded-lg border bg-card p-4">
            <h2 className="hidden items-center gap-2 font-semibold lg:flex">
              <SlidersHorizontal className="h-4 w-4" />
              {t("shop.filters")}
            </h2>
            <button
              type="button"
              className="flex min-h-11 w-full items-center justify-between gap-2 text-left font-semibold lg:hidden"
              aria-expanded={filtersOpen}
              aria-controls="catalog-filters"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <span className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                {t("shop.filters")}
              </span>
              <span aria-hidden="true">{filtersOpen ? "−" : "+"}</span>
            </button>
            <div
              id="catalog-filters"
              className={`${filtersOpen ? "block" : "hidden"} mt-4 space-y-5 lg:block`}
            >
              <div className="space-y-2">
                <label htmlFor="product-search" className="text-sm font-medium">
                  {t("shop.searchProducts")}
                </label>
                <Input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(event) => updateFilter("q", event.target.value, true)}
                />
              </div>
              <fieldset className="space-y-3">
                <legend className="mb-2 text-sm font-medium">{t("nav.anime")}</legend>
                <Button
                  variant={!anime ? "default" : "outline"}
                  className="w-full"
                  aria-pressed={!anime}
                  onClick={() => updateFilter("anime", "")}
                >
                  {t("shop.allAnime")}
                </Button>
                {titlesLoading && !animeOptions.length ? (
                  <div className="grid grid-cols-2 gap-2" aria-hidden="true">
                    {Array.from({ length: 4 }, (_, index) => (
                      <div
                        key={index}
                        className="flex animate-pulse flex-col items-center gap-2 rounded-md border p-2 motion-reduce:animate-none"
                      >
                        <div className="h-12 w-12 rounded-full bg-muted" />
                        <div className="h-8 w-full rounded bg-muted" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2" id="anime-options">
                    {visibleAnime.map((value) => {
                      const title = titles.find(
                        (title) => normalize(title.name) === normalize(value),
                      );
                      const imageRef = title?.image?.asset?._ref;
                      const selected = normalize(anime) === normalize(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={selected}
                          onClick={() => updateFilter("anime", selected ? "" : value)}
                          className={`flex min-w-0 flex-col items-center gap-2 rounded-md border p-2 text-center text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary/10 text-foreground" : "border-border hover:bg-accent"}`}
                        >
                          <span
                            className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted font-semibold"
                            aria-hidden="true"
                          >
                            {imageRef ? (
                              <Image
                                src={urlFor(imageRef).width(96).height(96).url()}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              value.slice(0, 2).toUpperCase()
                            )}
                          </span>
                          <span className="min-h-8 break-words">{value}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                {animeOptions.length > 4 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    aria-expanded={showAllAnime}
                    aria-controls="anime-options"
                    onClick={() => setShowAllAnime((value) => !value)}
                  >
                    {t(showAllAnime ? "shop.showLess" : "shop.showAllAnime")}
                  </Button>
                )}
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="mb-2 font-medium">{t("shop.priceRange")}</legend>
                {isLoading ? (
                  <div
                    aria-hidden="true"
                    className="h-12 animate-pulse rounded bg-muted motion-reduce:animate-none"
                  />
                ) : (
                  <>
                    <Slider
                      min={lowestPrice}
                      max={highestPrice > lowestPrice ? highestPrice : lowestPrice + 1}
                      step={0.01}
                      value={priceRange}
                      onValueChange={updatePriceRange}
                      disabled={lowestPrice === highestPrice}
                      thumbLabels={[t("shop.minPrice"), t("shop.maxPrice")]}
                      className="py-3"
                    />
                    <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
                      <span>Tshs. {priceRange[0].toLocaleString()}</span>
                      <span>Tshs. {priceRange[1].toLocaleString()}</span>
                    </div>
                  </>
                )}
              </fieldset>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(event) => updateFilter("inStock", event.target.checked ? "true" : "")}
                  className="h-4 w-4 accent-primary"
                />
                {t("shop.inStock")}
              </label>
              <Button variant="outline" className="w-full" onClick={resetFilters}>
                {t("shop.clearFilters")}
              </Button>
            </div>
          </aside>
          <section aria-label={t("shop.products")} className="min-w-0" aria-busy={isLoading}>
            {isError && !products.length ? (
              <ErrorState title={t("shop.loadError")} onRetry={() => void refetch()} />
            ) : isLoading ? (
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length ? (
              <>
                <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-6 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
                {hasNextPage && (
                  <Button
                    className="mt-6 w-full"
                    variant="outline"
                    disabled={isFetchingNextPage}
                    onClick={() => void fetchNextPage()}
                  >
                    {t(isFetchingNextPage ? "common.loading" : "common.loadMore")}
                  </Button>
                )}
                {productsError && (
                  <ErrorState title={t("shop.loadError")} onRetry={() => void fetchNextPage()} />
                )}
              </>
            ) : (
              <EmptyState
                className="rounded-lg border"
                illustration="collection"
                title={t("common.noProducts")}
                description={t("empty.shopDescription")}
                action={
                  <Button variant="outline" onClick={resetFilters}>
                    {t("shop.clearFilters")}
                  </Button>
                }
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
