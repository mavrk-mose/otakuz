import Image from "next/image";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const artwork = {
  chat: "/illustrations/otakuz-mascot-chat.webp",
  notifications: "/illustrations/otakuz-mascot-notifications.webp",
  history: "/illustrations/otakuz-mascot-history.webp",
  cart: "/illustrations/otakuz-mascot-cart.webp",
  error: "/illustrations/otakuz-empty-error.webp",
  "not-found": "/illustrations/otakuz-empty-not-found.webp",
  schedule: "/illustrations/otakuz-empty-schedule.webp",
  search: "/illustrations/otakuz-empty-search.webp",
  collection: "/illustrations/otakuz-empty-collection.webp",
};

/** Original Otakuz mascot artwork; the accompanying copy supplies the meaning. */
export function EmptyState({
  illustration = "collection",
  title,
  description,
  action,
  compact = false,
  heading = "h3",
  className,
}: {
  illustration?: keyof typeof artwork;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
  heading?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const Heading = heading;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center px-4 text-center",
        compact ? "py-6" : "py-10",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn("relative isolate mb-5 shrink-0", compact ? "w-32 sm:w-36" : "w-44 sm:w-52")}
      >
        <div className="absolute inset-4 -z-10 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute inset-2 -z-10 rounded-full border border-dashed border-primary/15" />
        <Image
          src={artwork[illustration]}
          alt=""
          width={640}
          height={640}
          sizes={compact ? "144px" : "208px"}
          className="otakuz-empty-float relative h-auto w-full object-contain drop-shadow-lg"
        />
        <Sparkles className="otakuz-empty-sparkle absolute -right-1 top-7 h-5 w-5 text-secondary" />
        <span className="otakuz-empty-sparkle absolute bottom-7 left-0 h-1.5 w-1.5 rounded-full bg-primary/60 [animation-delay:1.5s]" />
      </div>
      <Heading
        className={cn(
          "max-w-sm break-words font-semibold tracking-tight text-foreground",
          compact ? "text-sm" : "text-lg",
        )}
      >
        {title}
      </Heading>
      {description && (
        <p
          className={cn(
            "mt-2 max-w-sm text-pretty leading-relaxed text-muted-foreground",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>
      )}
    </div>
  );
}
