"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Package, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useBuyerOrders } from "@/hooks/shop/use-marketplace";
import { formatShopPrice } from "@/lib/shop-utils";

export default function BuyerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { data: orders = [], isLoading } = useBuyerOrders(user?.uid);

  if (authLoading || (user && isLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-14 text-center">
        <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-black">Sign in to view your orders</h1>
        <p className="mt-1 mb-5 text-sm text-muted-foreground">
          Track your Stripe purchases and delivery status across Otakuz creator shops.
        </p>
        <Button
          asChild
          className="bg-rose-500 font-semibold text-white hover:bg-rose-600"
        >
          <Link href="/auth">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            My Orders
          </h1>
          <p className="text-xs text-muted-foreground">
            Order receipts & fulfillment status for your Otakuz Shop purchases.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="gap-1.5">
          <Link href="/shop">
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed border-border bg-card p-12 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <h3 className="text-lg font-bold">No orders yet</h3>
          <p className="mt-1 mb-5 text-xs text-muted-foreground">
            Explore creator shops and official anime merch to place your first order.
          </p>
          <Button
            asChild
            className="bg-rose-500 font-semibold text-white hover:bg-rose-600"
          >
            <Link href="/shop">Browse Marketplace</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="space-y-4 border-border/80 bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge
                    className={
                      order.paymentStatus === "paid"
                        ? "bg-emerald-600 text-white"
                        : ""
                    }
                    variant={
                      order.paymentStatus === "paid" ? "default" : "secondary"
                    }
                  >
                    {order.paymentStatus.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Delivery: {order.fulfillmentStatus.toUpperCase()}
                  </Badge>
                </div>

                <span className="text-base font-black text-rose-500">
                  {formatShopPrice(order.total, order.currency)}
                </span>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${idx}`}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.selectedSize && (
                        <Badge variant="secondary" className="text-[10px]">
                          {item.selectedSize}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        × {item.quantity}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Store className="h-3 w-3 text-rose-500" />
                        {item.shopName}
                      </span>
                    </div>
                    <span className="font-semibold">
                      {formatShopPrice(
                        item.price * item.quantity,
                        order.currency
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
