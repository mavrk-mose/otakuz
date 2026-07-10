import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Watch not found</p>
            <p className="mb-8 text-muted-foreground">The anime you&apos;re looking for doesn&apos;t exist.</p>
            <Link
                href="/"
                className="rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-colors hover:bg-primary/90"
            >
                Back to Home
            </Link>
        </div>
    );
}
