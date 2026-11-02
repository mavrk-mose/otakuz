import Stripe from "stripe";
import type { AcceptedPaymentMethod, ShopCurrency } from "@/types/shop";

let stripeSingleton: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_SECRET_KEY.trim().startsWith("sk_")
  );
}

export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured. Add STRIPE_SECRET_KEY to your .env file to enable live/test Stripe operations."
    );
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeSingleton;
}

export function getPlatformFeePercent(): number {
  const raw = process.env.STRIPE_PLATFORM_FEE_PERCENT;
  if (raw === undefined || raw === "") {
    return 5;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 5;
  return Math.min(50, parsed);
}

export function resolveAppBaseUrl(req: Request): string {
  const envUrl =
    process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (envUrl && envUrl.startsWith("http")) {
    return envUrl.replace(/\/$/, "");
  }
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

export function buildStripeAllowedPaymentMethods(
  methods: AcceptedPaymentMethod[] | undefined,
  currency: ShopCurrency
): Stripe.Checkout.SessionCreateParams.AllowedPaymentMethodType[] {
  const selected = new Set<AcceptedPaymentMethod>(
    methods && methods.length > 0 ? methods : ["card"]
  );
  const types: Stripe.Checkout.SessionCreateParams.AllowedPaymentMethodType[] = [
    "card",
  ];

  if (selected.has("link") && ["USD", "EUR", "GBP", "JPY"].includes(currency)) {
    types.push("link");
  }

  if (selected.has("klarna") && ["USD", "EUR", "GBP"].includes(currency)) {
    types.push("klarna");
  }

  return types;
}
