import {useQuery} from "@tanstack/react-query";
import {Product} from "@/types/shop";
import {getProducts} from "@/lib/sanity";

interface ProductListProps {
    category?: string;
    priceRange?: [number, number];
    sortBy?: string;
}

const useFetchProducts = ({ category, priceRange, sortBy}: ProductListProps) => {
    const {
        data: products,
        isLoading
    } = useQuery({
        queryKey: ['products', category, priceRange, sortBy],
        queryFn: async () => {
            // Fetch all products
            let filteredProducts: Product[] = await getProducts();

            // Filter products based on category
            if (category && category !== 'all') {
                filteredProducts = filteredProducts.filter((p) => p.category === category);
            }

            // Filter products based on price range
            if (priceRange) {
                filteredProducts = filteredProducts.filter(
                    (p: { price: number }) => p.price >= priceRange[0] && p.price <= priceRange[1]
                );
            }

            // Sort products based on criteria
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

            // Return all filtered and sorted products
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