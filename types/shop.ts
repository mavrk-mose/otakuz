import type { SanityImage } from "./common";

export type ShopCurrency = "USD" | "TZS" | "JPY" | "EUR" | "GBP";

export type AcceptedPaymentMethod =
  | "card"
  | "link"
  | "apple_google_pay"
  | "klarna";

export type PayoutScheduleInterval = "daily" | "weekly" | "monthly" | "manual";

export type ShopStatus = "active" | "draft" | "paused";

export type ShopShippingPolicy = {
  flatRate: number;
  freeShippingThreshold: number | null;
  shipsWorldwide: boolean;
  estimatedDays: string;
};

export type SellerShop = {
  ownerId: string;
  shopName: string;
  slug: string;
  tagline: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  country: string;
  currency: ShopCurrency;
  status: ShopStatus;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  stripeDetailsSubmitted: boolean;
  acceptedPaymentMethods: AcceptedPaymentMethod[];
  payoutSchedule: PayoutScheduleInterval;
  shippingPolicy: ShopShippingPolicy;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type Variant = {
  name: string;
  price: number;
  stock: number;
};

export type Title = {
  _id: string;
  name: string;
  image?: SanityImage;
};

export type Product = {
  _id: string;
  name: string;
  price: number;
  currency?: ShopCurrency;
  image?: SanityImage[];
  imageUrls?: string[];
  rating: number;
  description: string;
  category: string;
  stock: number;
  sizes?: string[];
  variants: Variant[] | null;
  title?: Title;
  animeTitle?: string;
  // Multi-vendor seller metadata (present on user-created shop merch)
  source?: "sanity" | "community";
  ownerId?: string;
  shopId?: string;
  shopName?: string;
  shopSlug?: string;
  stripeAccountId?: string | null;
  stripeChargesEnabled?: boolean;
  acceptedPaymentMethods?: AcceptedPaymentMethod[];
  isPublished?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type CartItem = Product & {
  quantity: number;
  selectedSize?: string;
};

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderFulfillmentStatus =
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type ShopOrderItem = {
  productId: string;
  name: string;
  price: number;
  currency: ShopCurrency;
  quantity: number;
  selectedSize?: string;
  imageUrl?: string;
  sellerId: string;
  shopName: string;
  stripeAccountId?: string | null;
};

export type ShopOrder = {
  id: string;
  buyerId: string;
  buyerEmail: string;
  sellerIds: string[];
  items: ShopOrderItem[];
  currency: ShopCurrency;
  subtotal: number;
  shippingAmount: number;
  platformFeeAmount: number;
  sellerNetAmount: number;
  total: number;
  customerInfo: CustomerInfo;
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: OrderFulfillmentStatus;
  trackingNumber?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type OrderStatus = "pending" | "completed" | "cancelled";

export type Order = {
  _id: string;
  merchantId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  customerInfo: CustomerInfo;
  createdAt: string;
  updatedAt: string;
};
