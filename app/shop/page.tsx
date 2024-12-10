"use client"

import { useState } from 'react';
import { CategoryFilter } from '@/components/shop/category-filter';
import { SortFilter } from '@/components/shop/sort-filter';
import { CartDrawer } from '@/components/shop/cart-drawer';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { usePostHog } from 'posthog-js/react';
import { ProductList } from '@/components/shop/product-list';

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const posthog = usePostHog();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Anime Merch Shop</h1>
          <p className="text-muted-foreground">
            Discover our collection of authentic anime merchandise
          </p>
        </div>
        <Button variant="outline" className="mt-4 md:mt-0" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Cart ({totalItems})
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-6">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
          <SortFilter
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </aside>

        <main className="flex-1">
          <ProductList
            category={selectedCategory}
            sortBy={sortBy}
          />
        </main>
      </div>

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
}