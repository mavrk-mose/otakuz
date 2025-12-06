import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-xl mb-8">Watch not found</p>
            <p className="text-gray-400 mb-8">The anime you&apos;re looking for doesn&apos;t exist.</p>
            <Link
                href="/"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
                Back to Home
            </Link>
        </div>
    );
}