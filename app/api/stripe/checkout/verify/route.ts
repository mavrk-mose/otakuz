import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, isStripeConfigured } from "@/lib/stripe";

export async function executeMultiSellerSplitsIfPresent(
  stripe: Stripe,
  paymentIntent: Stripe.PaymentIntent,
  orderId: string
) {
  const splitsRaw = paymentIntent.metadata?.sellerSplits;
  if (!splitsRaw || !paymentIntent.transfer_group) return;

  let splits: Record<string, number> = {};
  try {
    splits = JSON.parse(splitsRaw);
  } catch {
    return;
  }

  for (const [acctId, netMinor] of Object.entries(splits)) {
    if (!acctId.startsWith("acct_") || netMinor <= 0) continue;
    try {
      await stripe.transfers.create(
        {
          amount: netMinor,
          currency: paymentIntent.currency,
          destination: acctId,
          transfer_group: paymentIntent.transfer_group,
          metadata: { orderId },
        },
        {
          idempotencyKey: `transfer_${orderId}_${acctId}`,
        }
      );
    } catch (transferErr) {
      console.warn(
        `[stripe/splits] Transfer to ${acctId} skipped or already processed:`,
        transferErr
      );
    }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { configured: false, error: "STRIPE_SECRET_KEY is not configured." },
      { status: 503 }
    );
  }

  if (!sessionId) {
    return NextResponse.json(
      { error: "Missing session_id query parameter." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    const isPaid = session.payment_status === "paid";
    const orderId =
      session.metadata?.orderId || session.client_reference_id || "";
    const paymentIntent =
      session.payment_intent && typeof session.payment_intent === "object"
        ? (session.payment_intent as Stripe.PaymentIntent)
        : null;

    if (isPaid && paymentIntent && orderId) {
      await executeMultiSellerSplitsIfPresent(stripe, paymentIntent, orderId);
    }

    return NextResponse.json({
      paid: isPaid,
      paymentStatus: session.payment_status,
      orderId,
      sessionId: session.id,
      paymentIntentId: paymentIntent?.id || null,
      amountTotal: session.amount_total,
      currency: session.currency?.toUpperCase() || "USD",
      customerEmail: session.customer_details?.email || session.customer_email || "",
    });
  } catch (err: any) {
    console.error("[stripe/checkout/verify] Error:", err);
    return NextResponse.json(
      { error: err?.message || "Could not verify Stripe Checkout session." },
      { status: 500 }
    );
  }
}
