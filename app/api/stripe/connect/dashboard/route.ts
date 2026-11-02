import { NextResponse } from "next/server";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          error:
            "STRIPE_SECRET_KEY is not configured. Add it to .env to open the Stripe Express Dashboard.",
        },
        { status: 503 }
      );
    }

    const { stripeAccountId } = await req.json();
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Missing stripeAccountId." },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);

    return NextResponse.json({ url: loginLink.url });
  } catch (err: any) {
    console.error("[stripe/connect/dashboard] Error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "Complete Stripe Connect onboarding first before opening the payout dashboard.",
      },
      { status: 400 }
    );
  }
}
