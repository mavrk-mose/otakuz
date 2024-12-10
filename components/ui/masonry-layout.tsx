'use client';

import { useAnimePictures } from "@/lib/queries";
import Image from "next/image";
import { Card } from "./card";

export function MasonryLayout({ id }: {id: string}) {
    const { data: pictures, isLoading } = useAnimePictures(id);

    if(isLoading) {
        return (
            Array(4)
            .fill(null)
            .map((_, index) => (
                <Card key={`next-page-loading-${index}`} className="animate-pulse">
                    <div className="aspect-[2/3] bg-muted" />
                    <div className="p-4 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                </Card>
            ))
        )
    }
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pictures?.map((picture, idx) => (
                <div className="grid gap-4" >
                        <div key={idx}>
                            <Image
                                className="h-auto max-w-full rounded-lg"
                                width={300}
                                height={450}
                                src={picture.jpg.large_image_url}
                                alt=""
                            />
                        </div>
                </div>
            ))}
        </div>

    )
}