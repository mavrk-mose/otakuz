import { useQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { SanityPage } from "@/lib/sanity-pagination";
import { Product } from "@/types/shop";
import { client } from "@/lib/sanity";

const useFetchProduct = (id: string) => {
  const queryClient = useQueryClient();
  const cachedProduct = () => {
    for (const [key, data] of queryClient.getQueriesData<InfiniteData<SanityPage<Product>>>({
      queryKey: ["productPages"],
    })) {
      const product = data?.pages.flatMap((page) => page.items).find((item) => item._id === id);
      if (product) return { product, updatedAt: queryClient.getQueryState(key)?.dataUpdatedAt };
    }
    return undefined;
  };
  const {
    data: product,
    isPending: isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["product", id],
    initialData: () => cachedProduct()?.product,
    initialDataUpdatedAt: () => cachedProduct()?.updatedAt,
    queryFn: async () => {
      const product: Product = await client.fetch(
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
        { id: id },
      );
      return product;
    },
  });

  return {
    product,
    isLoading,
    isError,
    refetch,
    isFetching,
  };
};

export default useFetchProduct;
