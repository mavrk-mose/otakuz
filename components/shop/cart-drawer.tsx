"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { toast } from "sonner";
import {
  CreditCard,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShieldCheck,
  Store,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/components/i18n-provider";
import { getCartLineId, useCart } from "@/store/use-cart";
import { formatShopPrice, resolveProductImage } from "@/lib/shop-utils";
import {
  attachStripeSessionToOrder,
  createPendingShopOrder,
} from "@/lib/shop-marketplace";
import type {
  AcceptedPaymentMethod,
  ShopCurrency,
  ShopOrderItem,
} from "@/types/shop";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const posthog = usePostHog();
  const { items, removeFromCart, updateQuantity } = useCart();

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [selectedCurrency, setSelectedCurrency] = useState<ShopCurrency>("USD");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Pre-fill customer details from authenticated user when available
  useEffect(() => {
    if (!user) return;
    setCustomerInfo((prev) => ({
      name: prev.name || user.displayName || "",
      email: prev.email || user.email || "",
      phone: prev.phone,
      address: prev.address,
    }));
  }, [user]);

  // Group cart items by currency because Stripe Checkout processes one currency per session
  const currenciesInCart = useMemo(() => {
    const set = new Set<ShopCurrency>();
    items.forEach((item) => set.add(item.currency || "USD"));
    return Array.from(set);
  }, [items]);

  useEffect(() => {
    if (
      currenciesInCart.length > 0 &&
      !currenciesInCart.includes(selectedCurrency)
    ) {
      setSelectedCurrency(currenciesInCart[0]);
    }
  }, [currenciesInCart, selectedCurrency]);

  const activeItems = useMemo(
    () =>
      items.filter((item) => (item.currency || "USD") === selectedCurrency),
    [items, selectedCurrency]
  );

  const subtotal = useMemo(
    () =>
      activeItems.reduce(
        (sum, item) => sum + item.price * Math.max(1, item.quantity || 1),
        0
      ),
    [activeItems]
  );

  // Intersection of accepted payment methods across items in this checkout batch
  const activePaymentMethods = useMemo<AcceptedPaymentMethod[]>(() => {
    const allMethods = new Set<AcceptedPaymentMethod>(["card"]);
    activeItems.forEach((item) => {
      (item.acceptedPaymentMethods || ["card", "apple_google_pay", "link"]).forEach(
        (m) => allMethods.add(m)
      );
    });
    return Array.from(allMethods);
  }, [activeItems]);

  const handleStripeCheckout = async () => {
    if (!user?.uid) {
      toast.info("Please sign in to complete your Stripe order.");
      onClose();
      router.push("/auth");
      return;
    }

    if (!customerInfo.name.trim() || !customerInfo.email.trim() || !customerInfo.address.trim()) {
      toast.error("Please fill in your name, email, and delivery address.");
      return;
    }

    if (activeItems.length === 0) return;

    setIsCheckingOut(true);
    try {
      const orderItems: ShopOrderItem[] = activeItems.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        currency: item.currency || "USD",
        quantity: Math.max(1, item.quantity || 1),
        ...(item.selectedSize ? { selectedSize: item.selectedSize } : {}),
        imageUrl: resolveProductImage(item, 0),
        sellerId: item.ownerId || "platform",
        shopName: item.shopName || "Otakuz Official",
        stripeAccountId: item.stripeAccountId || null,
      }));

      const sellerIds = Array.from(
        new Set(
          orderItems
            .map((i) => i.sellerId)
            .filter((id) => Boolean(id) && id !== "platform")
        )
      );

      const platformFeeAmount = Number((subtotal * 0.05).toFixed(2));
      const sellerNetAmount = Number(
        Math.max(0, subtotal - platformFeeAmount).toFixed(2)
      );

      const orderId = await createPendingShopOrder({
        buyerId: user.uid,
        buyerEmail: customerInfo.email.trim(),
        sellerIds,
        items: orderItems,
        currency: selectedCurrency,
        subtotal,
        shippingAmount: 0,
        platformFeeAmount,
        sellerNetAmount,
        total: subtotal,
        customerInfo: {
          name: customerInfo.name.trim(),
          phone: customerInfo.phone.trim(),
          email: customerInfo.email.trim(),
          address: customerInfo.address.trim(),
        },
      });

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          currency: selectedCurrency,
          items: orderItems,
          shippingAmount: 0,
          customerEmail: customerInfo.email.trim(),
          acceptedPaymentMethods: activePaymentMethods,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(
          data.error || "Unable to start Stripe Checkout session."
        );
      }

      await attachStripeSessionToOrder(orderId, data.sessionId);
      posthog?.capture("stripe_checkout_started", {
        orderId,
        currency: selectedCurrency,
        total: subtotal,
        itemCount: orderItems.length,
      });

      window.location.href = data.url;
    } catch (err: any) {
      console.error("[CartDrawer] Stripe Checkout error:", err);
      toast.error(err?.message || "Failed to initialize Stripe Checkout.");
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col border-border bg-card text-foreground sm:max-w-lg">
        <SheetHeader className="border-b border-border/80 pb-3">
          <div className="flex items-center justify-between pr-6">
            <SheetTitle className="text-lg font-bold">
              {t("shop.shoppingCart")}
            </SheetTitle>
            <Badge
              variant="outline"
              className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400"
            >
              <ShieldCheck className="h-3 w-3" />
              Stripe Protected
            </Badge>
          </div>
        </SheetHeader>

        {currenciesInCart.length > 1 && (
          <div className="mt-3 rounded-xl border border-border bg-background p-2.5">
            <p className="mb-2 text-[11px] font-medium text-muted-foreground">
              Your cart has items in multiple currencies. Select a currency group to check out via Stripe:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currenciesInCart.map((curr) => {
                const count = items.filter(
                  (i) => (i.currency || "USD") === curr
                ).length;
                return (
                  <Button
                    key={curr}
                    type="button"
                    size="sm"
                    variant={selectedCurrency === curr ? "default" : "outline"}
                    onClick={() => setSelectedCurrency(curr)}
                    className={
                      selectedCurrency === curr
                        ? "h-7 bg-rose-500 text-xs text-white hover:bg-rose-600"
                        : "h-7 text-xs"
                    }
                  >
                    {curr} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        <ScrollArea className="-mx-6 flex-1 px-6">
          {activeItems.length === 0 ? (
            <div className="py-14 text-center text-sm text-muted-foreground">
              {t("shop.emptyCart")}
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {activeItems.map((item) => {
                const lineId = getCartLineId(item._id, item.selectedSize);
                const qty = Math.max(1, item.quantity || 1);
                return (
                  <div
                    key={lineId}
                    className="flex gap-3.5 rounded-xl border border-border/70 bg-background/60 p-3"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={resolveProductImage(item, 0)}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-foreground">
                          {item.name}
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(lineId)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Store className="h-3 w-3 text-rose-500" />
                          {item.shopName || "Otakuz Official"}
                        </span>
                        {item.selectedSize && (
                          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                            Size: {item.selectedSize}
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        <span className="text-sm font-bold text-foreground">
                          {formatShopPrice(
                            item.price * qty,
                            item.currency || "USD"
                          )}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(lineId, qty - 1)}
                            disabled={qty <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-semibold">
                            {qty}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-lg"
                            onClick={() => updateQuantity(lineId, qty + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="space-y-3 border-t border-border/80 pt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t("shop.customerInformation")}
                </h3>
                <div className="space-y-2.5">
                  <Input
                    type="text"
                    placeholder={t("shop.name")}
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="bg-background"
                  />
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Input
                      type="email"
                      placeholder={t("shop.email")}
                      value={customerInfo.email}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="bg-background"
                    />
                    <Input
                      type="tel"
                      placeholder={t("shop.phone")}
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder={t("shop.deliveryAddress")}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        {activeItems.length > 0 && (
          <div className="mt-auto space-y-3 border-t border-border/80 pt-4">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
              <span>Accepted via Stripe:</span>
              <Badge variant="secondary" className="text-[10px]">
                Cards
              </Badge>
              {activePaymentMethods.includes("apple_google_pay") && (
                <Badge variant="secondary" className="text-[10px]">
                  Apple / Google Pay
                </Badge>
              )}
              {activePaymentMethods.includes("link") && (
                <Badge variant="secondary" className="text-[10px]">
                  Link
                </Badge>
              )}
              {activePaymentMethods.includes("klarna") && (
                <Badge variant="secondary" className="text-[10px]">
                  Klarna
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {t("shop.total")}
              </span>
              <span className="text-xl font-black text-foreground">
                {formatShopPrice(subtotal, selectedCurrency)}
              </span>
            </div>

            <Button
              size="lg"
              disabled={isCheckingOut}
              onClick={handleStripeCheckout}
              className="w-full gap-2 bg-rose-500 font-semibold text-white hover:bg-rose-600"
            >
              {isCheckingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting to Stripe...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Pay with Stripe ({formatShopPrice(subtotal, selectedCurrency)})
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                256-bit SSL Stripe Checkout
              </span>
              <Link
                href="/shop/orders"
                onClick={onClose}
                className="font-medium text-rose-500 hover:underline"
              >
                My Orders
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
