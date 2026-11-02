"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getShopByOwnerId,
  getShopBySlug,
  listActiveShops,
  listBuyerOrders,
  listSellerOrders,
  listSellerOwnProducts,
  listShopPublishedProducts,
} from "@/lib/shop-marketplace";
import type { Product, SellerShop, ShopOrder } from "@/types/shop";

interface TypedQueryState<T> {
  data: T | undefined;
  isLoading: boolean;
  refetch: () => unknown;
}

export function useMySellerShop(
  ownerId?: string | null
): TypedQueryState<SellerShop | null> {
  return useQuery<SellerShop | null>({
    queryKey: ["sellerShop", ownerId],
    queryFn: () => getShopByOwnerId(ownerId!),
    enabled: Boolean(ownerId),
    staleTime: 20_000,
  });
}

export function usePublicShops(maxCount = 24): TypedQueryState<SellerShop[]> {
  return useQuery<SellerShop[]>({
    queryKey: ["publicShops", maxCount],
    queryFn: () => listActiveShops(maxCount),
    staleTime: 45_000,
  });
}

export function useShopBySlug(
  slug?: string
): TypedQueryState<SellerShop | null> {
  return useQuery<SellerShop | null>({
    queryKey: ["publicShopBySlug", slug],
    queryFn: () => getShopBySlug(slug!),
    enabled: Boolean(slug),
    staleTime: 30_000,
  });
}

export function useShopProductsByOwner(
  ownerId?: string | null
): TypedQueryState<Product[]> {
  return useQuery<Product[]>({
    queryKey: ["publicShopProducts", ownerId],
    queryFn: () => listShopPublishedProducts(ownerId!),
    enabled: Boolean(ownerId),
    staleTime: 30_000,
  });
}

export function useSellerOwnProducts(
  ownerId?: string | null
): TypedQueryState<Product[]> {
  return useQuery<Product[]>({
    queryKey: ["sellerOwnProducts", ownerId],
    queryFn: () => listSellerOwnProducts(ownerId!),
    enabled: Boolean(ownerId),
    staleTime: 15_000,
  });
}

export function useSellerOrders(
  sellerId?: string | null
): TypedQueryState<ShopOrder[]> {
  return useQuery<ShopOrder[]>({
    queryKey: ["sellerOrders", sellerId],
    queryFn: () => listSellerOrders(sellerId!),
    enabled: Boolean(sellerId),
    staleTime: 15_000,
  });
}

export function useBuyerOrders(
  buyerId?: string | null
): TypedQueryState<ShopOrder[]> {
  return useQuery<ShopOrder[]>({
    queryKey: ["buyerOrders", buyerId],
    queryFn: () => listBuyerOrders(buyerId!),
    enabled: Boolean(buyerId),
    staleTime: 15_000,
  });
}

export interface StripeConnectLiveStatus {
  configured: boolean;
  platformFeePercent: number;
  error?: string;
  account?: {
    id: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    onboardingComplete: boolean;
    country: string;
    defaultCurrency: string;
    currentlyDue: string[];
    externalAccounts: {
      id: string;
      object: string;
      bankName: string;
      last4: string;
      currency: string;
      defaultForCurrency: boolean;
    }[];
  } | null;
}

export function useStripeConnectStatus(
  stripeAccountId?: string | null
): TypedQueryState<StripeConnectLiveStatus> {
  return useQuery<StripeConnectLiveStatus>({
    queryKey: ["stripeConnectStatus", stripeAccountId || "none"],
    queryFn: async () => {
      const qs = stripeAccountId
        ? `?accountId=${encodeURIComponent(stripeAccountId)}`
        : "";
      const res = await fetch(`/api/stripe/connect/status${qs}`);
      return res.json();
    },
    staleTime: 20_000,
  });
}
