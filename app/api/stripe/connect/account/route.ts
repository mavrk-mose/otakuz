import { NextResponse } from "next/server";
import {
  getStripeClient,
  isStripeConfigured,
  resolveAppBaseUrl,
} from "@/lib/stripe";
import type { PayoutScheduleInterval } from "@/types/shop";

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          error:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY (and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) to your .env file to enable Stripe Connect onboarding.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      ownerId,
      email,
      shopName,
      shopSlug,
      country = "US",
      existingStripeAccountId,
      payoutSchedule = "daily",
    }: {
      ownerId?: string;
      email?: string;
      shopName?: string;
      shopSlug?: string;
      country?: string;
      existingStripeAccountId?: string | null;
      payoutSchedule?: PayoutScheduleInterval;
    } = body;

    if (!ownerId || !shopName) {
      return NextResponse.json(
        { error: "Missing required seller ownerId or shopName." },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl = resolveAppBaseUrl(req);
    let accountId = existingStripeAccountId || null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: country.toUpperCase(),
        email: email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: {
          name: shopName,
          product_description: `Anime & manga merchandise sold on Otakuz Marketplace (${shopName})`,
        },
        metadata: {
          ownerId,
          shopSlug: shopSlug || "",
          platform: "otakuz",
        },
      });
      accountId = account.id;
    }

    // Attempt to sync payout schedule preference when supported by the account's country
    try {
      const scheduleParams =
        payoutSchedule === "manual"
          ? ({ interval: "manual" } as const)
          : payoutSchedule === "weekly"
            ? ({ interval: "weekly", weekly_anchor: "monday" } as const)
            : payoutSchedule === "monthly"
              ? ({ interval: "monthly", monthly_anchor: 1 } as const)
              : ({ interval: "daily" } as const);

      await stripe.accounts.update(accountId, {
        business_profile: { name: shopName },
        settings: {
          payouts: {
            schedule: scheduleParams,
          },
        },
      });
    } catch {
      // Some Stripe Connect countries enforce fixed payout intervals; safe to ignore
    }

    const account = await stripe.accounts.retrieve(accountId);

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/shop/seller?tab=payments&stripe=refresh`,
      return_url: `${baseUrl}/shop/seller?tab=payments&stripe=return&account_id=${accountId}`,
      type: "account_onboarding",
    });

    return NextResponse.json({
      configured: true,
      stripeAccountId: accountId,
      onboardingUrl: accountLink.url,
      chargesEnabled: Boolean(account.charges_enabled),
      payoutsEnabled: Boolean(account.payouts_enabled),
      detailsSubmitted: Boolean(account.details_submitted),
    });
  } catch (err: any) {
    console.error("[stripe/connect/account] Error:", err);
    return NextResponse.json(
      {
        configured: isStripeConfigured(),
        error: err?.message || "Failed to initialize Stripe Connect account.",
      },
      { status: 500 }
    );
  }
}
