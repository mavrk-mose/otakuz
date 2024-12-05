export function TimelineSkeleton() {
    return (
        <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />
            {[...Array(2)].map((_, index) => {
                const isLeft = index % 2 === 0;
                return (
                    <div
                        key={index}
                        className={`relative grid grid-cols-[1fr_auto_1fr] gap-4 mb-8 ${
                            isLeft ? 'text-right' : 'text-left'
                        }`}
                    >
                        <div className={isLeft ? 'pr-4' : 'col-start-3 pl-4'}>
                            <div className="p-4 bg-muted rounded-md space-y-4 animate-pulse">
                                <div className="h-48 w-full bg-muted rounded-md" />
                                <div className="space-y-2">
                                    <div className="h-6 bg-muted w-3/4 rounded-md" />
                                    <div className="h-4 bg-muted w-1/2 rounded-md" />
                                    <div className="h-4 bg-muted w-2/3 rounded-md" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-muted ring-4 ring-background animate-pulse" />
                        </div>

                        <div
                            className={`flex items-center ${
                                isLeft ? 'justify-start pl-4' : 'justify-end pr-4'
                            }`}
                        >
                            <div className="bg-muted px-4 py-2 rounded-full animate-pulse">
                                <div className="h-4 bg-muted w-16 rounded-md" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
