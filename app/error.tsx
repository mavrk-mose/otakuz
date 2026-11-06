"use client";

import { ErrorState } from "@/components/page-state";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState fullPage onRetry={reset} />;
}
