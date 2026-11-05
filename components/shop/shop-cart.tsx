"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCart } from "@/store/use-cart";
import { useI18n } from "@/components/i18n-provider";

export function ShopCart() {
  const { t } = useI18n();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <>
      <div className="sticky top-[4.5rem] lg:top-4 z-40 flex justify-end px-4 pointer-events-none mx-auto max-w-7xl">
        <Button
          data-shop-cart
          variant="outline"
          className="pointer-events-auto h-11 shrink-0 gap-2 bg-background shadow-sm"
          onClick={() => setIsCartOpen(true)}
          aria-label={`${t("shop.cart")} (${totalItems})`}
        >
          <ShoppingCart className="h-5 w-5" aria-hidden="true" />
          <span className="hidden sm:inline">{t("shop.cart")}</span>
          <span aria-live="polite" aria-atomic="true">({totalItems})</span>
        </Button>
      </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
