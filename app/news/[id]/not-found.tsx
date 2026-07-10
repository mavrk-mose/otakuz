import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewsArticleNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Newspaper className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">
          404 · News
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Story not found</h1>
        <p className="mt-4 text-muted-foreground">
          This article may have been removed or the link may be incorrect.
        </p>
        <Button asChild className="mt-7">
          <Link href="/news">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to news
          </Link>
        </Button>
      </div>
    </div>
  );
}
