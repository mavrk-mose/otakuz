import {useQuery, useQueryClient} from "@tanstack/react-query";
import {Product} from "@/types/shop";
import {client} from "@/lib/sanity";

const useFetchProduct = (id: string) => {
    const queryClient = useQueryClient();
    const {
        data: product,
        isPending: isLoading,
        isError, refetch, isFetching
    } = useQuery({
        queryKey: ['product', id],
        initialData: () => queryClient.getQueryData<Product[]>(['products'])?.find(product => product._id === id),
        initialDataUpdatedAt: () => queryClient.getQueryState(['products'])?.dataUpdatedAt,
        queryFn: async () => {
            const product: Product = await client.fetch(`
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
      `, { id: id });
            return product;
        },
    });

    return {
        product,
        isLoading, isError, refetch, isFetching
    }
}

export default useFetchProduct;