import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/types/shop";
import { client } from "@/lib/sanity";
import { getCommunityProductById } from "@/lib/shop-marketplace";

const useFetchProduct = (
  id: string
): { product: Product | null | undefined; isLoading: boolean } => {
  const { data: product, isLoading } = useQuery<Product | null>({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const [communityItem, sanityItem] = await Promise.allSettled([
        getCommunityProductById(id),
        client.fetch(
          `
          *[_type == "product" && _id == $id][0] {
            _id,
            name,
            description,
            price,
            image[],
            category,
            rating,
            stock,
            variants
          }
        `,
          { id }
        ),
      ]);

      if (communityItem.status === "fulfilled" && communityItem.value) {
        return communityItem.value;
      }

      if (sanityItem.status === "fulfilled" && sanityItem.value) {
        return {
          ...sanityItem.value,
          currency: sanityItem.value.currency || "USD",
          source: "sanity",
          shopName: "Otakuz Official",
        } as Product;
      }

      return null;
    },
  });

  return {
    product,
    isLoading,
  };
};

export default useFetchProduct;
