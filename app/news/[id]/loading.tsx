export default function NewsArticleLoading() {
  return (
    <div className="-m-4 grid min-h-[calc(100vh-5rem)] animate-pulse lg:grid-cols-2">
      <div className="min-h-[48vh] bg-muted lg:min-h-full" />
      <div className="flex flex-col justify-center space-y-6 p-8 sm:p-12">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="space-y-3">
          <div className="h-16 w-full rounded bg-muted" />
          <div className="h-16 w-4/5 rounded bg-muted" />
        </div>
        <div className="h-8 w-3/4 rounded bg-muted" />
        <div className="h-12 w-56 rounded bg-muted" />
      </div>
    </div>
  );
}
