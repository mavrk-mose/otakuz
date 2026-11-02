import { urlFor } from "@/lib/sanity";
import type {
  AcceptedPaymentMethod,
  Product,
  ShopCurrency,
} from "@/types/shop";

export interface CurrencyConfig {
  code: ShopCurrency;
  symbol: string;
  label: string;
  zeroDecimal: boolean;
  minStripeMajorAmount: number;
}

export const SUPPORTED_SHOP_CURRENCIES: Record<ShopCurrency, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    label: "US Dollar ($ USD)",
    zeroDecimal: false,
    minStripeMajorAmount: 0.5,
  },
  TZS: {
    code: "TZS",
    symbol: "Tshs.",
    label: "Tanzanian Shilling (Tshs. TZS)",
    zeroDecimal: false,
    minStripeMajorAmount: 1500,
  },
  JPY: {
    code: "JPY",
    symbol: "¥",
    label: "Japanese Yen (¥ JPY)",
    zeroDecimal: true,
    minStripeMajorAmount: 50,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    label: "Euro (€ EUR)",
    zeroDecimal: false,
    minStripeMajorAmount: 0.5,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    label: "British Pound (£ GBP)",
    zeroDecimal: false,
    minStripeMajorAmount: 0.3,
  },
};

export const SHOP_CATEGORIES = [
  "Figures",
  "Apparel",
  "Accessories",
  "Manga & Books",
  "Prints & Art",
  "Collectibles",
  "Home & Decor",
] as const;

export const STRIPE_CONNECT_COUNTRIES = [
  { code: "US", label: "United States" },
  { code: "JP", label: "Japan" },
  { code: "GB", label: "United Kingdom" },
  { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "NL", label: "Netherlands" },
  { code: "SG", label: "Singapore" },
  { code: "HK", label: "Hong Kong" },
  { code: "TZ", label: "Tanzania" },
  { code: "KE", label: "Kenya" },
  { code: "ZA", label: "South Africa" },
] as const;

export const PAYMENT_METHOD_OPTIONS: {
  id: AcceptedPaymentMethod;
  label: string;
  description: string;
  badge: string;
}[] = [
  {
    id: "card",
    label: "Credit & Debit Cards",
    description: "Accept Visa, Mastercard, American Express, Discover, and JCB globally.",
    badge: "Required",
  },
  {
    id: "apple_google_pay",
    label: "Apple Pay & Google Pay",
    description: "One-tap biometric digital wallets automatically enabled on compatible devices.",
    badge: "Express Wallet",
  },
  {
    id: "link",
    label: "Stripe Link",
    description: "Autofill saved buyer payment & shipping details for 1-click checkout.",
    badge: "Fast Checkout",
  },
  {
    id: "klarna",
    label: "Klarna (Buy Now, Pay Later)",
    description: "Let fans split higher-ticket figures & merch into flexible installments (USD/EUR/GBP).",
    badge: "Installments",
  },
];

export function formatShopPrice(
  amount: number,
  currency: ShopCurrency = "USD"
): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const cfg = SUPPORTED_SHOP_CURRENCIES[currency] || SUPPORTED_SHOP_CURRENCIES.USD;

  if (cfg.zeroDecimal) {
    return `${cfg.symbol}${Math.round(safeAmount).toLocaleString()}`;
  }
  if (currency === "TZS") {
    return `${cfg.symbol} ${safeAmount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${cfg.symbol}${safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function toStripeUnitAmount(
  majorAmount: number,
  currency: ShopCurrency = "USD"
): number {
  const cfg = SUPPORTED_SHOP_CURRENCIES[currency] || SUPPORTED_SHOP_CURRENCIES.USD;
  if (cfg.zeroDecimal) {
    return Math.max(1, Math.round(majorAmount));
  }
  return Math.max(1, Math.round(majorAmount * 100));
}

export function fromStripeUnitAmount(
  unitAmount: number,
  currency: ShopCurrency = "USD"
): number {
  const cfg = SUPPORTED_SHOP_CURRENCIES[currency] || SUPPORTED_SHOP_CURRENCIES.USD;
  if (cfg.zeroDecimal) {
    return unitAmount;
  }
  return Number((unitAmount / 100).toFixed(2));
}

export function slugifyShopName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80";

export function resolveAllProductImages(product: Partial<Product> | null | undefined): string[] {
  if (!product) return [FALLBACK_PRODUCT_IMAGE];

  const resolved: string[] = [];

  if (Array.isArray(product.imageUrls)) {
    for (const url of product.imageUrls) {
      if (typeof url === "string" && url.trim().length > 0) {
        resolved.push(url.trim());
      }
    }
  }

  if (Array.isArray(product.image)) {
    for (const img of product.image) {
      if (!img) continue;
      if (typeof img === "string" && (img as string).trim().length > 0) {
        resolved.push(img);
        continue;
      }
      try {
        const ref = (img as { asset?: { _ref?: string; url?: string } })?.asset;
        if (ref?.url) {
          resolved.push(ref.url);
        } else if (ref?._ref) {
          resolved.push(urlFor(ref._ref).url());
        }
      } catch {
        // Ignore malformed Sanity asset references
      }
    }
  }

  return resolved.length > 0 ? resolved : [FALLBACK_PRODUCT_IMAGE];
}

export function resolveProductImage(
  product: Partial<Product> | null | undefined,
  index = 0
): string {
  const images = resolveAllProductImages(product);
  return images[index] || images[0] || FALLBACK_PRODUCT_IMAGE;
}
