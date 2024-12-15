"use client"

import {ProductCard} from './product-card';
import useFetchProducts from "@/hooks/shop/use-fetch-products";
import Lottie from "lottie-react";
import Pochita from "@/public/lottie/pochita.json"

interface ProductListProps {
    category?: string;
    priceRange?: [number, number];
    sortBy?: string;
}

export function ProductList(props: ProductListProps) {
    const {products, isLoading} = useFetchProducts(props);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                        <div className="aspect-square bg-muted rounded-lg"/>
                        <div className="mt-4 space-y-2">
                            <div className="h-4 bg-muted rounded w-3/4"/>
                            <div className="h-4 bg-muted rounded w-1/2"/>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!products || !products.some(() => products.length > 0)) {
        return (
            <div className="flex items-center justify-center">
                <div className="text-center">
                    <div className="text-lg font-semibold mb-4">No products found</div>
                    <div className="mx-auto w-100 h-150">
                        <Lottie
                            animationData={Pochita}
                            loop={true}
                            style={{width: '100%', height: '100%'}}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                        <ProductCard key={product._id} product={product}/>
                    )
                )}
            </div>
        </div>
    );
}