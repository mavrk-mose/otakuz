"use client"

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { usePostHog } from 'posthog-js/react';
import { useState } from 'react';
import {urlFor} from "@/lib/sanity";
import { useCart } from '@/store/use-cart';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const posthog = usePostHog();

  const total = items.reduce((sum, item) => sum + (item.price * (item.stock || 1)), 0);

  const handleCheckout = async () => {
    const message = `New Order:\n\n${items.map(item => 
      `${item.name} x${item.stock || 1} - $${(item.price * (item.stock || 1)).toFixed(2)}`
    ).join('\n')}\n\nTotal: $${total.toFixed(2)}\n\nCustomer Details:\nName: ${customerInfo.name}\nPhone: ${customerInfo.phone}\nEmail: ${customerInfo.email}\nAddress: ${customerInfo.address}`;

    //TODO get the number from environment variables
    const whatsappUrl = `https://wa.me/255768159239?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onClose();

    posthog.capture('checkout clicked')
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <ScrollArea className="flex-1 -mx-6 px-6">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Your cart is empty
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="relative w-20 h-20">
                      <Image
                        src={urlFor(item?.image[0].asset._ref).url()}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Tshs. {item.price.toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item._id, (item.stock || 1) - 1)}
                          disabled={(item.stock || 1) <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span>{item.stock || 1}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item._id, (item.stock || 1) + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-auto text-destructive"
                          onClick={() => removeFromCart(item._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-4 py-4">
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-4">Customer Information</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full p-2 border rounded"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="w-full p-2 border rounded"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full p-2 border rounded"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <textarea
                      placeholder="Delivery Address"
                      className="w-full p-2 border rounded"
                      value={customerInfo.address}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          {items.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={handleCheckout}>
                Checkout
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}