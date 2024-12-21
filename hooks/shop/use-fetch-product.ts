import {useQuery} from "@tanstack/react-query";
import {Product} from "@/types/shop";
import {client} from "@/lib/sanity";

const useFetchProduct = (id: string) => {
    const {
        data: product,
        isLoading
    } = useQuery({
        queryKey: ['product', id],
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
        isLoading
    }
}

export default useFetchProduct;