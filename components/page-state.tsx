"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/components/i18n-provider";
import { cn } from "@/lib/utils";

export function ErrorState({
  title,
  description,
  onRetry,
  retrying = false,
  fullPage = false,
  compact = false,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  retrying?: boolean;
  fullPage?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <div
      role="alert"
      className={cn(
        fullPage && "flex min-h-[65vh] items-center justify-center",
        className,
      )}
    >
      <EmptyState
        illustration="error"
        heading={fullPage ? "h1" : "h3"}
        compact={compact}
        className={fullPage ? "[&_h1]:text-3xl [&_h1]:font-bold" : undefined}
        title={title ?? t("status.errorTitle")}
        description={description ?? t("status.errorDescription")}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry} disabled={retrying}>
              <RefreshCw
                className={cn("mr-2 h-4 w-4", retrying && "animate-spin")}
                aria-hidden="true"
              />
              {t("common.tryAgain")}
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

export function MissingPage({
  title,
  description,
  href = "/",
  actionLabel,
}: {
  title?: ReactNode;
  description?: ReactNode;
  href?: string;
  actionLabel?: ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center">
      <p className="pt-6 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-primary">
        404 · OTAKUZ
      </p>
      <EmptyState
        illustration="not-found"
        heading="h1"
        className="[&_h1]:text-3xl [&_h1]:font-bold"
        title={title ?? t("status.notFoundTitle")}
        description={description ?? t("status.notFoundDescription")}
        action={
          <Button asChild>
            <Link href={href}>
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              {actionLabel ?? t("status.backHome")}
            </Link>
          </Button>
        }
      />
    </div>
  );
}
