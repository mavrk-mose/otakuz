"use client"

import {ProductGrid} from "@/components/shop/product-grid";
import {useParams} from "next/navigation";

export default function TitlePage() {
    const params = useParams();
    const rawSlug = params?.slug as string | undefined;
    const titleFilter = rawSlug && rawSlug !== "all" ? rawSlug : undefined;
    return (
        <div className="min-h-screen bg-background pb-4 text-foreground">
            <div className="py-4 px-6">
                <ProductGrid title={titleFilter}/>
            </div>
        </div>
    )
}
