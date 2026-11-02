import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";
import { executeMultiSellerSplitsIfPresent } from "@/app/api/stripe/checkout/verify/route";

export async function POST(req: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "STRIPE_SECRET_KEY is not configured." },
      { status: 503 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 503 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  try {
    const rawBody = await req.text();
    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId =
        session.metadata?.orderId || session.client_reference_id || "";
      if (
        session.payment_status === "paid" &&
        typeof session.payment_intent === "string" &&
        orderId
      ) {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        await executeMultiSellerSplitsIfPresent(stripe, pi, orderId);
      }
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (err: any) {
    console.error("[stripe/webhook] Verification failed:", err);
    return NextResponse.json(
      { error: err?.message || "Webhook signature verification failed." },
      { status: 400 }
    );
  }
}
