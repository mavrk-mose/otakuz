export default function DetailsSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
                {/* Left Column Skeleton */}
                <div className="space-y-4">
                    {/* Manga Cover */}
                    <div className="w-full h-[450px] bg-muted rounded-md animate-pulse"/>
                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="h-10 bg-muted rounded-md animate-pulse"/>
                        <div className="h-10 bg-muted rounded-md animate-pulse"/>
                    </div>
                    {/* ScoreCard */}
                    <div className="p-4 bg-muted rounded-md space-y-4 animate-pulse">
                        <div className="h-6 bg-muted rounded-md w-1/4"/>
                        <div className="h-5 bg-muted rounded-md w-1/2"/>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="h-4 bg-muted rounded-md w-3/4"/>
                            <div className="h-4 bg-muted rounded-md w-3/4"/>
                            <div className="h-4 bg-muted rounded-md w-3/4"/>
                            <div className="h-4 bg-muted rounded-md w-3/4"/>
                        </div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="space-y-6">
                    {/* Title Skeleton */}
                    <div>
                        <div className="h-8 bg-muted rounded-md w-3/4 animate-pulse"/>
                        <div className="h-6 bg-muted rounded-md w-1/2 animate-pulse mt-2"/>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <div className="h-6 bg-muted rounded-md w-16 animate-pulse"/>
                            <div className="h-6 bg-muted rounded-md w-16 animate-pulse"/>
                            <div className="h-6 bg-muted rounded-md w-16 animate-pulse"/>
                        </div>
                    </div>
                    {/* Synopsis Skeleton */}
                    <div className="p-6 bg-muted rounded-md animate-pulse space-y-4">
                        <div className="h-6 bg-muted rounded-md w-1/4"/>
                        <div className="h-4 bg-muted rounded-md w-full"/>
                        <div className="h-4 bg-muted rounded-md w-5/6"/>
                        <div className="h-4 bg-muted rounded-md w-4/6"/>
                    </div>
                    {/* Information Card Skeleton */}
                    <div className="p-6 bg-muted rounded-md animate-pulse space-y-4">
                        <div className="h-6 bg-muted rounded-md w-1/4"/>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <div className="h-4 bg-muted rounded-md w-3/4 mb-2"/>
                                <div className="h-4 bg-muted rounded-md w-2/3"/>
                                <div className="h-4 bg-muted rounded-md w-2/3"/>
                            </div>
                            <div>
                                <div className="h-4 bg-muted rounded-md w-3/4 mb-2"/>
                                <div className="h-4 bg-muted rounded-md w-2/3"/>
                                <div className="h-4 bg-muted rounded-md w-2/3"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}