"use client";
import { I18nText } from "@/components/i18n-text";
import { useI18n } from "@/components/i18n-provider";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Flame,
  Gamepad2,
  Sparkles,
  Ticket,
  Cpu,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ADSENSE_CLIENT_ID,
  ADSENSE_GENERAL_SLOT,
  resolveAdSenseSlot,
  resolveAdSenseFormat,
} from "@/lib/adsense-config";
import {
  getCampaignsForContext,
  type AdContextCategory,
  type AdInterestTag,
  type DynamicAdCampaign,
} from "@/lib/ads-catalog";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export type AdPlacementVariant =
  "spotlight" | "leaderboard" | "in-feed-grid" | "sidebar" | "timeline";

interface GoogleAdUnitProps {
  /** Google AdSense data-ad-slot ID (falls back to the configured default slot) */
  adSlot?: string;
  /** AdSense format when live AdSense fills */
  adFormat?: "auto" | "fluid" | "rectangle" | "horizontal" | "vertical";
  /** Optional AdSense layout key for in-feed / in-article units */
  adLayoutKey?: string;
  /** Contextual vertical determining which geek/gaming/energy/event ads display */
  context: AdContextCategory;
  /** Visual UI layout */
  variant?: AdPlacementVariant;
  /** Offset into the contextual ad pool so multiple units on one page show distinct ads */
  seedOffset?: number;
  className?: string;
}

const INTEREST_FILTERS: ("All" | AdInterestTag)[] = [
  "All",
  "Gaming PCs",
  "Energy Drinks",
  "Geek Gear",
  "Anime & Merch",
  "Events & Cons",
  "Creator Tech",
];

function getInterestIcon(tag: AdInterestTag) {
  switch (tag) {
    case "Energy Drinks":
      return Zap;
    case "Gaming PCs":
      return Cpu;
    case "Geek Gear":
      return Gamepad2;
    case "Events & Cons":
      return Ticket;
    case "Creator Tech":
      return Sparkles;
    case "Anime & Merch":
    default:
      return Flame;
  }
}

/**
 * Renders an official Google AdSense `<ins className="adsbygoogle" />` slot when
 * `NEXT_PUBLIC_ADSENSE_CLIENT_ID` + `adSlot` are configured, AND pairs/falls back
 * seamlessly to dynamic, interactive Otakuz partner ad showcases (Anime, Gaming PCs,
 * Mechanical Keyboards, Energy Drinks, Conventions & Tech) when AdSense is not yet
 * configured or marks the slot unfilled.
 */
export function GoogleAdUnit({
  adSlot,
  adFormat = "auto",
  adLayoutKey,
  context,
  variant = "leaderboard",
  seedOffset = 0,
  className,
}: GoogleAdUnitProps) {
  const { t: localizedT } = useI18n();
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim() || ADSENSE_CLIENT_ID;
  const resolvedSlot =
    resolveAdSenseSlot(adSlot, process.env.NEXT_PUBLIC_ADSENSE_DEFAULT_SLOT) ||
    ADSENSE_GENERAL_SLOT;
  const resolvedFormat = resolveAdSenseFormat(adFormat, adLayoutKey);

  const hasLiveAdSenseConfig = clientId.startsWith("ca-pub-") && resolvedSlot.length > 0;

  const insRef = useRef<HTMLModElement | null>(null);
  const pushedRef = useRef(false);
  const [adSenseStatus, setAdSenseStatus] = useState<"idle" | "pending" | "filled" | "unfilled">(
    hasLiveAdSenseConfig ? "pending" : "unfilled",
  );

  const [selectedInterest, setSelectedInterest] = useState<"All" | AdInterestTag>("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const campaigns = useMemo(() => {
    const base = getCampaignsForContext(context, selectedInterest);
    if (base.length <= 1 || seedOffset === 0) return base;
    const shift = seedOffset % base.length;
    return [...base.slice(shift), ...base.slice(0, shift)];
  }, [context, selectedInterest, seedOffset]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedInterest, context]);

  // Auto-rotate dynamic spotlight & leaderboard ads for higher engagement
  useEffect(() => {
    if (isPaused || campaigns.length <= 1) return;
    if (variant !== "spotlight" && variant !== "leaderboard" && variant !== "sidebar") {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % campaigns.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [campaigns.length, isPaused, variant]);

  // Initialize real Google AdSense unit when configured
  useEffect(() => {
    if (!hasLiveAdSenseConfig || !insRef.current) {
      return;
    }

    const el = insRef.current;
    const observer = new MutationObserver(() => {
      const status = el.getAttribute("data-ad-status");
      if (status === "filled") {
        setAdSenseStatus("filled");
      } else if (status === "unfilled") {
        setAdSenseStatus("unfilled");
      }
    });

    observer.observe(el, {
      attributes: true,
      attributeFilter: ["data-ad-status"],
    });

    try {
      if (!pushedRef.current && !el.hasAttribute("data-adsbygoogle-status")) {
        pushedRef.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch {
      setAdSenseStatus("unfilled");
    }

    return () => {
      observer.disconnect();
    };
  }, [hasLiveAdSenseConfig]);

  const handleCopyPromo = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success(`Promo code "${code}" copied!`);
      window.setTimeout(() => setCopiedCode(null), 2200);
    });
  };

  const currentCampaign: DynamicAdCampaign =
    campaigns[activeIndex % campaigns.length] || campaigns[0];
  const TagIcon = getInterestIcon(currentCampaign.interestTag);

  return (
    <div
      className={cn("w-full", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Google retains ownership of the mounted slot, including late callbacks. */}
      {hasLiveAdSenseConfig && (
        <div
          hidden={adSenseStatus === "unfilled"}
          className="mb-3 overflow-hidden rounded-2xl border border-border/80 bg-card p-3"
        >
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <span>
              <I18nText message="ads.sponsored" />
            </span>
            <span>
              <I18nText message="ads.ad" />
            </span>
          </div>
          <ins
            ref={insRef}
            className="adsbygoogle block min-h-[90px] w-full overflow-hidden"
            style={{ display: "block" }}
            data-ad-client={clientId}
            data-ad-slot={resolvedSlot}
            data-ad-format={resolvedFormat}
            {...(adLayoutKey ? { "data-ad-layout-key": adLayoutKey } : {})}
            data-full-width-responsive="true"
          />
        </div>
      )}

      {/* Dynamic Contextual Monetization UI (renders when AdSense is unfilled/unconfigured, or as interactive spotlight) */}
      {adSenseStatus !== "filled" && variant === "spotlight" && (
        <Card className="relative overflow-hidden border-border/80 bg-card shadow-sm">
          {/* Top Ad Bar + Interactive Geek Interest Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 bg-muted/30 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sponsored
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                AdSense Curated Picks for Otakus & Gamers
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {INTEREST_FILTERS.slice(0, 5).map((pill) => {
                const active = selectedInterest === pill;
                return (
                  <button
                    key={pill}
                    type="button"
                    onClick={() => setSelectedInterest(pill)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition",
                      active
                        ? "bg-rose-500 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {pill}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Interactive Spotlight Body */}
          <div
            className={cn(
              "grid grid-cols-1 gap-6 bg-gradient-to-r p-5 sm:p-7 lg:grid-cols-12 lg:items-center",
              currentCampaign.accentClass,
            )}
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border/60 bg-muted lg:col-span-5">
              <Image
                src={currentCampaign.imageUrl}
                alt={currentCampaign.headline}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
              <Badge className="absolute left-3 top-3 bg-rose-500 font-mono text-[10px] font-bold text-white shadow">
                {currentCampaign.discountBadge}
              </Badge>
            </div>

            <div className="flex flex-col justify-between space-y-4 lg:col-span-7">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-500">
                    <TagIcon className="h-3.5 w-3.5" />
                    {currentCampaign.interestTag}
                  </span>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {currentCampaign.brand}
                  </span>
                </div>

                <h3 className="text-xl font-black leading-tight tracking-tight text-foreground sm:text-2xl">
                  {currentCampaign.headline}
                </h3>

                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {currentCampaign.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    asChild
                    className="gap-1.5 bg-rose-500 font-semibold text-white hover:bg-rose-600"
                  >
                    <a
                      href={currentCampaign.href}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                    >
                      <span>{currentCampaign.ctaLabel}</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>

                  {currentCampaign.promoCode && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyPromo(e, currentCampaign.promoCode!)}
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-rose-500/50 bg-background/80 px-3 font-mono text-xs font-bold text-foreground transition hover:border-rose-500 hover:bg-rose-500/5"
                    >
                      <span>CODE: {currentCampaign.promoCode}</span>
                      {copiedCode === currentCampaign.promoCode ? (
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>

                {/* Carousel Controls */}
                {campaigns.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={localizedT("ads.previous")}
                      onClick={() =>
                        setActiveIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="px-1 font-mono text-[11px] text-muted-foreground">
                      {(activeIndex % campaigns.length) + 1}/{campaigns.length}
                    </span>
                    <button
                      type="button"
                      aria-label={localizedT("ads.next")}
                      onClick={() => setActiveIndex((prev) => (prev + 1) % campaigns.length)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition hover:text-foreground"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Horizontal Leaderboard Variant */}
      {adSenseStatus !== "filled" && variant === "leaderboard" && (
        <Card
          className={cn(
            "relative overflow-hidden border-border/80 bg-card bg-gradient-to-r p-4 sm:p-5",
            currentCampaign.accentClass,
          )}
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted sm:h-20 sm:w-32">
                <Image
                  src={currentCampaign.imageUrl}
                  alt={currentCampaign.headline}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-border bg-background/90 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                    <I18nText message="ads.ad" />
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-rose-500">
                    <TagIcon className="h-3 w-3" />
                    {currentCampaign.brand}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {currentCampaign.discountBadge}
                  </Badge>
                </div>

                <h3 className="line-clamp-1 text-base font-bold text-foreground sm:text-lg">
                  {currentCampaign.headline}
                </h3>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {currentCampaign.description}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end md:self-center">
              {currentCampaign.promoCode && (
                <button
                  type="button"
                  onClick={(e) => handleCopyPromo(e, currentCampaign.promoCode!)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-dashed border-rose-500/40 bg-background/90 px-2.5 font-mono text-xs font-bold text-foreground hover:border-rose-500"
                >
                  <span>{currentCampaign.promoCode}</span>
                  {copiedCode === currentCampaign.promoCode ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              )}

              <Button
                size="sm"
                asChild
                className="gap-1 bg-rose-500 font-semibold text-white hover:bg-rose-600"
              >
                <a href={currentCampaign.href} target="_blank" rel="sponsored noopener noreferrer">
                  <span>{currentCampaign.ctaLabel}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Multi-Card Native In-Feed Grid (3 Geek / Gaming / Energy / Event Offers) */}
      {adSenseStatus !== "filled" && variant === "in-feed-grid" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Sponsored Picks
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Featured Gear, Fuel & Deals
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              AdSense Multiplex
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {campaigns.slice(0, 3).map((item) => {
              const ItemIcon = getInterestIcon(item.interestTag);
              return (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="group block h-full"
                >
                  <Card className="flex h-full flex-col overflow-hidden border-border/80 bg-card transition hover:-translate-y-0.5 hover:border-rose-500/40 hover:shadow-md">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      <Image
                        src={item.imageUrl}
                        alt={item.headline}
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <Badge className="absolute left-2.5 top-2.5 bg-background/90 text-[10px] font-bold text-foreground backdrop-blur">
                        {item.discountBadge}
                      </Badge>
                      <span className="absolute right-2.5 top-2.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[9px] uppercase text-white">
                        <I18nText message="ads.ad" />
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-rose-500">
                          <ItemIcon className="h-3.5 w-3.5" />
                          <span>{item.interestTag}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="truncate font-mono text-[10px] text-muted-foreground">
                            {item.brand}
                          </span>
                        </div>
                        <h4 className="line-clamp-2 text-sm font-bold text-foreground transition-colors group-hover:text-rose-500">
                          {item.headline}
                        </h4>
                        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                        {item.promoCode ? (
                          <button
                            type="button"
                            onClick={(e) => handleCopyPromo(e, item.promoCode!)}
                            className="inline-flex items-center gap-1 rounded border border-dashed border-border bg-background px-2 py-0.5 font-mono text-[10px] font-bold text-foreground hover:border-rose-500"
                          >
                            <span>{item.promoCode}</span>
                            <Copy className="h-2.5 w-2.5 text-muted-foreground" />
                          </button>
                        ) : (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            Partner Offer
                          </span>
                        )}

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-500">
                          {item.ctaLabel}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Vertical Sidebar Rectangle / Skyscraper Variant */}
      {adSenseStatus !== "filled" && variant === "sidebar" && (
        <Card className="overflow-hidden border-border/80 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-4 py-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Sponsored • AdSense
            </span>
            <Badge variant="outline" className="text-[10px]">
              {currentCampaign.interestTag}
            </Badge>
          </div>

          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            <Image
              src={currentCampaign.imageUrl}
              alt={currentCampaign.headline}
              fill
              sizes="360px"
              className="object-cover"
            />
            <Badge className="absolute bottom-2.5 left-2.5 bg-rose-500 text-[10px] font-bold text-white">
              {currentCampaign.discountBadge}
            </Badge>
          </div>

          <div className="space-y-3 p-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-rose-500">
              {currentCampaign.brand}
            </p>
            <h4 className="text-base font-bold leading-snug text-foreground">
              {currentCampaign.headline}
            </h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {currentCampaign.description}
            </p>

            {currentCampaign.promoCode && (
              <button
                type="button"
                onClick={(e) => handleCopyPromo(e, currentCampaign.promoCode!)}
                className="flex w-full items-center justify-between rounded-lg border border-dashed border-rose-500/40 bg-background px-3 py-1.5 font-mono text-xs font-bold text-foreground hover:border-rose-500"
              >
                <span>USE CODE: {currentCampaign.promoCode}</span>
                {copiedCode === currentCampaign.promoCode ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            )}

            <Button
              asChild
              className="w-full gap-1.5 bg-rose-500 font-semibold text-white hover:bg-rose-600"
            >
              <a href={currentCampaign.href} target="_blank" rel="sponsored noopener noreferrer">
                <span>{currentCampaign.ctaLabel}</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </Card>
      )}

      {/* Event Timeline Native Card Variant */}
      {adSenseStatus !== "filled" && variant === "timeline" && (
        <Card className="overflow-hidden border border-rose-500/25 bg-card transition-all hover:border-rose-500/50 hover:shadow-md">
          <a
            href={currentCampaign.href}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="block p-4 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:h-40 sm:w-44">
                <Image
                  src={currentCampaign.imageUrl}
                  alt={currentCampaign.headline}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
                <span className="absolute left-2 top-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                  Sponsored
                </span>
              </div>

              <div className="flex flex-1 flex-col justify-between space-y-2.5">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase text-rose-500">
                      <TagIcon className="h-3.5 w-3.5" />
                      {currentCampaign.brand}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {currentCampaign.discountBadge}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground sm:text-xl">
                    {currentCampaign.headline}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {currentCampaign.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {currentCampaign.promoCode ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopyPromo(e, currentCampaign.promoCode!)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-rose-500/40 bg-background px-2.5 py-1 font-mono text-xs font-bold text-foreground"
                    >
                      <span>Promo: {currentCampaign.promoCode}</span>
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      Official Event Partner
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 text-sm font-bold text-rose-500">
                    {currentCampaign.ctaLabel}
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </a>
        </Card>
      )}
    </div>
  );
}
