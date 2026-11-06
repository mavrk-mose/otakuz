import { MissingPage } from "@/components/page-state";

export default function NewsArticleNotFound() {
  return (
    <MissingPage
      title="Story not found"
      description="This article may have been removed or the link may be incorrect."
      href="/news"
      actionLabel="Back to news"
    />
  );
}
