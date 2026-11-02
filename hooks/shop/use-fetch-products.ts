import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/shop";
import { getProducts } from "@/lib/sanity";
import { listPublishedCommunityProducts } from "@/lib/shop-marketplace";

interface ProductListProps {
  category?: string;
  priceRange?: [number, number];
  sortBy?: string;
  title?: string;
}

export async function fetchUnifiedMarketplaceProducts(): Promise<Product[]> {
  const [communityResult, sanityResult] = await Promise.allSettled([
    listPublishedCommunityProducts(200),
    getProducts(),
  ]);

  const communityProducts: Product[] =
    communityResult.status === "fulfilled" && Array.isArray(communityResult.value)
      ? communityResult.value
      : [];

  const sanityProducts: Product[] =
    sanityResult.status === "fulfilled" && Array.isArray(sanityResult.value)
      ? sanityResult.value.map((p: any) => ({
          ...p,
          currency: p.currency || "USD",
          source: "sanity" as const,
          shopName: p.shopName || "Otakuz Official",
        }))
      : [];

  // Put creator/community listings first so newly published merch surfaces immediately
  return [...communityProducts, ...sanityProducts];
}

const useFetchProducts = ({
  category,
  priceRange,
  sortBy,
  title,
}: ProductListProps): {
  products: Product[] | undefined;
  isLoading: boolean;
} => {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["products", category, priceRange, sortBy, title],
    queryFn: async () => {
      let filteredProducts = await fetchUnifiedMarketplaceProducts();

      if (category && category !== "all") {
        const lowerCat = category.toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) => (p.category || "").toLowerCase() === lowerCat
        );
      }

      if (priceRange) {
        filteredProducts = filteredProducts.filter(
          (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
        );
      }

      if (title) {
        const decodedTitle = decodeURIComponent(title).toLowerCase();
        filteredProducts = filteredProducts.filter(
          (p) =>
            p.title?.name?.toLowerCase() === decodedTitle ||
            p.animeTitle?.toLowerCase() === decodedTitle ||
            p.animeTitle?.toLowerCase().includes(decodedTitle)
        );
      }

      if (sortBy) {
        filteredProducts = [...filteredProducts].sort((a, b) => {
          switch (sortBy) {
            case "price-low":
              return a.price - b.price;
            case "price-high":
              return b.price - a.price;
            case "rating":
              return (b.rating ?? 0) - (a.rating ?? 0);
            default:
              return 0;
          }
        });
      }

      return filteredProducts;
    },
    staleTime: 30_000,
  });

  return {
    products,
    isLoading,
  };
};

export default useFetchProducts;
