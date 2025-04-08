"use client"

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { client } from '@/lib/sanity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsProps {
  merchantId: string;
}

export function Analytics({ merchantId }: AnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', merchantId],
    queryFn: async () => {
      const query = `{
        'products': count(*[_type == "product" && merchantId == $merchantId]),
        'events': count(*[_type == "event" && merchantId == $merchantId]),
        'orders': *[_type == "order" && merchantId == $merchantId] {
          total,
          createdAt
        }
      }`;
      return client.fetch(query, { merchantId });
    },
  });

  if (isLoading) {
    return <div>Loading analytics...</div>;
  }

  const monthlyRevenue = analytics?.orders.reduce((acc: any, order: any) => {
    const month = new Date(order.createdAt).toLocaleString('default', { month: 'long' });
    acc[month] = (acc[month] || 0) + order.total;
    return acc;
  }, {});

  const chartData = Object.entries(monthlyRevenue || {}).map(([month, revenue]) => ({
    month,
    revenue,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Products
          </h3>
          <p className="text-3xl font-bold mt-2">{analytics?.products}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Events
          </h3>
          <p className="text-3xl font-bold mt-2">{analytics?.events}</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Orders
          </h3>
          <p className="text-3xl font-bold mt-2">{analytics?.orders?.length}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}