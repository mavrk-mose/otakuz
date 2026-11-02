import { NextResponse } from "next/server";
import {
  getPlatformFeePercent,
  getStripeClient,
  isStripeConfigured,
} from "@/lib/stripe";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!isStripeConfigured()) {
    return NextResponse.json({
      configured: false,
      platformFeePercent: getPlatformFeePercent(),
    });
  }

  if (!accountId) {
    return NextResponse.json({
      configured: true,
      platformFeePercent: getPlatformFeePercent(),
      account: null,
    });
  }

  try {
    const stripe = getStripeClient();
    const account = await stripe.accounts.retrieve(accountId, {
      expand: ["external_accounts"],
    });

    const externalAccounts =
      account.external_accounts?.data?.map((ext: any) => ({
        id: ext.id,
        object: ext.object, // 'bank_account' | 'card'
        bankName: ext.bank_name || ext.brand || "Payout Account",
        last4: ext.last4 || "••••",
        currency: (ext.currency || "usd").toUpperCase(),
        defaultForCurrency: Boolean(ext.default_for_currency),
      })) ?? [];

    return NextResponse.json({
      configured: true,
      platformFeePercent: getPlatformFeePercent(),
      account: {
        id: account.id,
        chargesEnabled: Boolean(account.charges_enabled),
        payoutsEnabled: Boolean(account.payouts_enabled),
        detailsSubmitted: Boolean(account.details_submitted),
        onboardingComplete:
          Boolean(account.details_submitted) && Boolean(account.charges_enabled),
        country: account.country,
        defaultCurrency: account.default_currency?.toUpperCase() || "USD",
        currentlyDue: account.requirements?.currently_due ?? [],
        externalAccounts,
      },
    });
  } catch (err: any) {
    console.error("[stripe/connect/status] Error:", err);
    return NextResponse.json(
      {
        configured: true,
        platformFeePercent: getPlatformFeePercent(),
        error: err?.message || "Could not retrieve Stripe Connect status.",
      },
      { status: 500 }
    );
  }
}
