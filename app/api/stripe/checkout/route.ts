import { NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  buildStripeAllowedPaymentMethods,
  getPlatformFeePercent,
  getStripeClient,
  isStripeConfigured,
  resolveAppBaseUrl,
} from "@/lib/stripe";
import { toStripeUnitAmount } from "@/lib/shop-utils";
import type {
  AcceptedPaymentMethod,
  ShopCurrency,
  ShopOrderItem,
} from "@/types/shop";

export async function POST(req: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          error:
            "Stripe Checkout requires STRIPE_SECRET_KEY in your .env file.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const {
      orderId,
      currency = "USD",
      items = [],
      shippingAmount = 0,
      customerEmail,
      acceptedPaymentMethods,
    }: {
      orderId: string;
      currency: ShopCurrency;
      items: ShopOrderItem[];
      shippingAmount?: number;
      customerEmail?: string;
      acceptedPaymentMethods?: AcceptedPaymentMethod[];
    } = body;

    if (!orderId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart items and orderId are required to start Stripe Checkout." },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const baseUrl = resolveAppBaseUrl(req);
    const feePercent = getPlatformFeePercent();
    const lowerCurrency = currency.toLowerCase();

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => {
        const unitAmount = toStripeUnitAmount(item.price, currency);
        const imageList =
          item.imageUrl && item.imageUrl.startsWith("http")
            ? [item.imageUrl]
            : undefined;

        return {
          quantity: Math.max(1, Number(item.quantity || 1)),
          price_data: {
            currency: lowerCurrency,
            unit_amount: unitAmount,
            product_data: {
              name: item.selectedSize
                ? `${item.name} (${item.selectedSize})`
                : item.name,
              description: item.shopName
                ? `Sold by ${item.shopName}`
                : "Otakuz Official Merch",
              images: imageList,
              metadata: {
                productId: item.productId,
                sellerId: item.sellerId || "platform",
              },
            },
          },
        };
      }
    );

    if (shippingAmount > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: lowerCurrency,
          unit_amount: toStripeUnitAmount(shippingAmount, currency),
          product_data: {
            name: "Standard Shipping & Handling",
          },
        },
      });
    }

    // Aggregate minor-unit totals per connected Stripe account
    const connectedTotalsByAccount = new Map<string, number>();
    let totalOrderMinor = 0;

    for (const item of items) {
      const lineMinor =
        toStripeUnitAmount(item.price, currency) *
        Math.max(1, Number(item.quantity || 1));
      totalOrderMinor += lineMinor;

      if (item.stripeAccountId && item.stripeAccountId.startsWith("acct_")) {
        connectedTotalsByAccount.set(
          item.stripeAccountId,
          (connectedTotalsByAccount.get(item.stripeAccountId) || 0) + lineMinor
        );
      }
    }

    if (shippingAmount > 0) {
      totalOrderMinor += toStripeUnitAmount(shippingAmount, currency);
    }

    const connectedAccounts = Array.from(connectedTotalsByAccount.keys());
    const allowedPaymentMethodTypes = buildStripeAllowedPaymentMethods(
      acceptedPaymentMethods,
      currency
    );

    const paymentIntentData: Stripe.Checkout.SessionCreateParams.PaymentIntentData =
      {
        metadata: {
          orderId,
          platformFeePercent: String(feePercent),
        },
      };

    if (
      connectedAccounts.length === 1 &&
      connectedTotalsByAccount.get(connectedAccounts[0]) ===
        totalOrderMinor -
          (shippingAmount > 0 ? toStripeUnitAmount(shippingAmount, currency) : 0)
    ) {
      // Single connected seller: verify charges_enabled before using destination charge
      const destinationAcct = connectedAccounts[0];
      try {
        const acct = await stripe.accounts.retrieve(destinationAcct);
        if (acct.charges_enabled) {
          const applicationFeeMinor = Math.round(
            totalOrderMinor * (feePercent / 100)
          );
          paymentIntentData.transfer_data = {
            destination: destinationAcct,
          };
          if (applicationFeeMinor > 0) {
            paymentIntentData.application_fee_amount = applicationFeeMinor;
          }
        }
      } catch (acctErr) {
        console.warn(
          "[stripe/checkout] Destination account lookup skipped, collecting on platform:",
          acctErr
        );
      }
    } else if (connectedAccounts.length > 0) {
      // Multi-seller cart: use Separate Charges & Transfers via transfer_group
      const splits: Record<string, number> = {};
      for (const [acctId, grossMinor] of connectedTotalsByAccount.entries()) {
        const netMinor = Math.max(
          1,
          Math.round(grossMinor * (1 - feePercent / 100))
        );
        splits[acctId] = netMinor;
      }
      paymentIntentData.transfer_group = `order_${orderId}`;
      paymentIntentData.metadata = {
        ...paymentIntentData.metadata,
        sellerSplits: JSON.stringify(splits).slice(0, 490),
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allowed_payment_method_types: allowedPaymentMethodTypes,
      line_items: lineItems,
      customer_email: customerEmail || undefined,
      client_reference_id: orderId,
      payment_intent_data: paymentIntentData,
      metadata: {
        orderId,
        currency,
      },
      success_url: `${baseUrl}/shop/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}`,
      cancel_url: `${baseUrl}/shop?checkout=cancelled&order_id=${encodeURIComponent(orderId)}`,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err: any) {
    console.error("[stripe/checkout] Error creating session:", err);
    return NextResponse.json(
      {
        error:
          err?.message || "Could not create Stripe Checkout session.",
      },
      { status: 500 }
    );
  }
}
