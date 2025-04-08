"use client"

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCatalog } from '@/components/shop/merchant/product-catalog';
import { EventManager } from '@/components/shop/merchant/event-manager';
import { Analytics } from '@/components/shop/merchant/analytics';
import { Settings } from '@/components/shop/merchant/settings';
import { useAuth } from '@/hooks/use-auth';
import { client } from '@/lib/sanity';
import { redirect } from 'next/navigation';

export default function MerchantDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');

  const { data: merchant, isLoading } = useQuery({
    queryKey: ['merchant', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const query = `*[_type == "merchant" && userId == $userId][0]`;
      return client.fetch(query, { userId: user.uid });
    },
    enabled: !!user,
  });

  if (!user) {
    redirect('/auth');
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!merchant) {
    redirect('/shop/merchant/register');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Merchant Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your products, events, and store settings
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog">
          <ProductCatalog merchantId={merchant._id} />
        </TabsContent>

        <TabsContent value="events">
          <EventManager merchantId={merchant._id} />
        </TabsContent>

        <TabsContent value="analytics">
          <Analytics merchantId={merchant._id} />
        </TabsContent>

        <TabsContent value="settings">
          <Settings merchant={merchant} />
        </TabsContent>
      </Tabs>
    </div>
  );
}