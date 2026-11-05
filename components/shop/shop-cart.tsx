"use client";

import { useState, type ReactNode } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { useCart } from "@/store/use-cart";
import { useSidebarStore } from "@/store/use-sidebar-store";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/i18n-provider";

export function ShopCart({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const isExpanded = useSidebarStore(state => state.isExpanded);
  return (
    <>
      {children && (
        <div className="sticky top-14 lg:top-16 z-30 mx-auto max-w-7xl bg-background/95 px-2 py-2 backdrop-blur sm:px-4">
          {children}
        </div>
      )}
        <Button
          data-shop-cart
          size="icon"
          className={cn(
            "fixed left-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 h-16 w-16 rounded-full border border-primary-foreground/20 shadow-xl transition-[left,box-shadow] duration-300 hover:shadow-2xl lg:bottom-6",
            isExpanded ? "lg:left-[264px]" : "lg:left-24"
          )}
          onClick={() => setIsCartOpen(true)}
          aria-label={`${t("shop.cart")} (${totalItems})`}
        >
          <ShoppingCart className="h-8 w-8" aria-hidden="true" />
          <span className="absolute -right-1 -top-1 flex h-7 min-w-[1.75rem] items-center justify-center rounded-full border-2 border-background bg-foreground px-1 text-xs font-bold tabular-nums text-background" aria-live="polite" aria-atomic="true">
            {totalItems}
          </span>
        </Button>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
