"use client"

import {ProductGrid} from "@/components/shop/product-grid";
import {useParams} from "next/navigation";

export default function TitlePage() {
    const params = useParams();
    const slug = params?.slug;
    return (
        <div className="min-h-screen bg-black text-white pb-4">
            <div className="py-4 px-6">
                <ProductGrid title={slug as string}/>
            </div>
        </div>
    )
}