import {useQuery} from "@tanstack/react-query";
import {Product} from "@/types/shop";
import {getProducts} from "@/lib/sanity";

interface ProductListProps {
    category?: string;
    priceRange?: [number, number];
    sortBy?: string;
    title?: string;
}

const useFetchProducts = ({ category, priceRange, sortBy, title }: ProductListProps) => {
    const {
        data: products,
        isLoading
    } = useQuery({
        queryKey: ['products', category, priceRange, sortBy, title],
        queryFn: async () => {
            let filteredProducts: Product[] = await getProducts();

            if (category && category !== 'all') {
                filteredProducts = filteredProducts.filter((p) => p.category === category);
            }

            if (priceRange) {
                filteredProducts = filteredProducts.filter(
                    (p: { price: number }) => p.price >= priceRange[0] && p.price <= priceRange[1]
                );
            }

            if (sortBy) {
                filteredProducts.sort((a, b) => {
                    switch (sortBy) {
                        case 'price-low':
                            return a.price - b.price;
                        case 'price-high':
                            return b.price - a.price;
                        case 'rating':
                            return (b.rating ?? 0) - (a.rating ?? 0);
                        default:
                            return 0;
                    }
                });
            }

            if (title) {
                const decodedTitle = decodeURIComponent(title);
                filteredProducts = filteredProducts.filter((p) => p.title['name'] === decodedTitle);
            }

            return filteredProducts;
        },
        staleTime: Infinity
    });

    return {
        products,
        isLoading,
    }
}

export default useFetchProducts;