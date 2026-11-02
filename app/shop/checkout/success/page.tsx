"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  PackageCheck,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/store/use-cart";
import {
  confirmBuyerOrderPayment,
  getShopOrderById,
} from "@/lib/shop-marketplace";
import { formatShopPrice } from "@/lib/shop-utils";
import type { ShopOrder } from "@/types/shop";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id") || "";
  const orderId = searchParams.get("order_id") || "";
  const { removeItemsByIds, clearCart } = useCart();

  const [isVerifying, setIsVerifying] = useState(true);
  const [verifiedPaid, setVerifiedPaid] = useState(false);
  const [order, setOrder] = useState<ShopOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function verifyOrder() {
      if (!sessionId) {
        setErrorMessage("Missing Stripe Checkout session ID.");
        setIsVerifying(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/stripe/checkout/verify?session_id=${encodeURIComponent(
            sessionId
          )}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Could not verify payment status.");
        }

        const resolvedOrderId = orderId || data.orderId;
        if (data.paid && resolvedOrderId) {
          await confirmBuyerOrderPayment(
            resolvedOrderId,
            sessionId,
            data.paymentIntentId || null
          );
          const fetchedOrder = await getShopOrderById(resolvedOrderId);
          if (active) {
            setOrder(fetchedOrder);
            setVerifiedPaid(true);
            if (fetchedOrder?.items?.length) {
              removeItemsByIds(fetchedOrder.items.map((i) => i.productId));
            } else {
              clearCart();
            }
          }
        } else if (active) {
          setVerifiedPaid(Boolean(data.paid));
        }
      } catch (err: any) {
        if (active) {
          setErrorMessage(
            err?.message || "Payment verification encountered an issue."
          );
        }
      } finally {
        if (active) {
          setIsVerifying(false);
        }
      }
    }

    verifyOrder();
    return () => {
      active = false;
    };
  }, [sessionId, orderId, removeItemsByIds, clearCart]);

  if (isVerifying) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-9 w-9 animate-spin text-rose-500" />
        <p className="text-sm font-medium text-muted-foreground">
          Confirming your Stripe payment & notifying seller(s)...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="border-border/80 bg-card p-8 text-center">
        {verifiedPaid ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <Badge className="mb-3 bg-emerald-600 text-white">
              Stripe Payment Confirmed
            </Badge>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              Thank You for Your Order!
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment has been processed securely via Stripe and routed to the creator shop(s).
            </p>

            {order && (
              <div className="mt-6 rounded-2xl border border-border/80 bg-background p-5 text-left">
                <div className="mb-3 flex items-center justify-between border-b border-border/70 pb-2.5 text-xs text-muted-foreground">
                  <span>Order #{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="font-semibold text-foreground">
                    Total Paid: {formatShopPrice(order.total, order.currency)}
                  </span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div
                      key={`${item.productId}-${idx}`}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.name}{" "}
                        {item.selectedSize ? `(${item.selectedSize})` : ""} ×{" "}
                        {item.quantity}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          ({item.shopName})
                        </span>
                      </span>
                      <span className="font-semibold">
                        {formatShopPrice(
                          item.price * item.quantity,
                          order.currency
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-amber-500" />
            <h1 className="text-2xl font-black text-foreground">
              Payment Pending Verification
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {errorMessage ||
                "Your Stripe Checkout session has not been marked paid yet."}
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="gap-2 bg-rose-500 font-semibold text-white hover:bg-rose-600"
          >
            <Link href="/shop/orders">
              <PackageCheck className="h-4 w-4" />
              View My Orders
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
