"use client"

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { client } from '@/lib/sanity';

export default function ProductPage({ params }: { params: { id: string } }) {
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', params.id],
    queryFn: async () => {
      const product = await client.fetch(`
        *[_type == "product" && _id == $id][0] {
          _id,
          name,
          description,
          price,
          "image": image.asset->url,
          category,
          rating,
          stock,
          variants
        }
      `, { id: params.id });
      return product;
    },
  });

  const { addToCart } = useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Product not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 font-medium">{product.rating}</span>
              </div>
              <Badge>{product.category}</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-2xl font-bold">${product.price}</p>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Variants</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant: any) => (
                  <Button
                    key={variant.name}
                    variant="outline"
                    className="justify-between"
                  >
                    <span>{variant.name}</span>
                    <span>${variant.price}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline">
              <Heart className="h-5 w-5" />
            </Button>
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="space-y-4">
              <Card className="p-4">
                <dl className="space-y-2">
                  <div className="flex">
                    <dt className="w-24 text-muted-foreground">Category</dt>
                    <dd>{product.category}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-24 text-muted-foreground">Stock</dt>
                    <dd>{product.stock} units</dd>
                  </div>
                </dl>
              </Card>
            </TabsContent>
            <TabsContent value="shipping">
              <Card className="p-4">
                <p className="text-muted-foreground">
                  Shipping information will be provided at checkout.
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="reviews">
              <Card className="p-4">
                <p className="text-muted-foreground">
                  Customer reviews coming soon.
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}