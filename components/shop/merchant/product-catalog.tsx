"use client"

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Upload, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/sanity';
import Image from 'next/image';

interface ProductCatalogProps {
  merchantId: string;
}

export function ProductCatalog({ merchantId }: ProductCatalogProps) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productImage, setProductImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', merchantId],
    queryFn: async () => {
      const query = `*[_type == "product" && merchantId == $merchantId]`;
      return client.fetch(query, { merchantId });
    },
  });

  const addProduct = useMutation({
    mutationFn: async (formData: FormData) => {
      if (!productImage) throw new Error('Product image is required');

      const imageAsset = await client.assets.upload('image', productImage);
      
      return client.create({
        _type: 'product',
        merchantId,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        category: formData.get('category') as string,
        stock: Number(formData.get('stock')),
        image: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id
          }
        },
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', merchantId] });
      setIsAddProductOpen(false);
      setProductImage(undefined);
      setImagePreview(undefined);
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      return client.delete(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', merchantId] });
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addProduct.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Catalog</h2>
        <Button onClick={() => setIsAddProductOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product: any) => (
          <Card key={product._id} className="p-4">
            <div className="relative aspect-square mb-4">
              <Image
                src={product.image.asset.url}
                alt={product.name}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {product.description}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-bold">${product.price}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  onClick={() => deleteProduct.mutate(product._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Image</label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('productImage')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                <Input
                  id="productImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  required
                />
              </div>
              {imagePreview && (
                <div className="relative h-40 w-40 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Name</label>
              <Input name="name" required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input type="number" name="price" min="0" step="0.01" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock</label>
                <Input type="number" name="stock" min="0" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input name="category" required />
            </div>

            <Button type="submit" className="w-full">
              Add Product
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}