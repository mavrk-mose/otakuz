"use client";

import { useState, type ReactNode } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCart } from "@/store/use-cart";
import { useI18n } from "@/components/i18n-provider";

export function ShopCart({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  return (
    <>
      <div className={`sticky top-14 lg:top-16 z-30 mx-auto flex max-w-7xl items-center justify-between gap-3 px-2 py-2 sm:px-4 ${children ? "bg-background/95 backdrop-blur" : "pointer-events-none justify-end"}`}>
        {children && <div className="min-w-0 flex-1">{children}</div>}
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
