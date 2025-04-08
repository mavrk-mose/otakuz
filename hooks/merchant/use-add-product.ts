"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/sanity";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AddProductProps {
  merchantId: string;
}

export function useAddProduct({ merchantId }: AddProductProps) {
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productImage, setProductImage] = useState<File>();
  const [imagePreview, setImagePreview] = useState<string>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      if (!productImage) throw new Error("Product image is required");

      const imageAsset = await client.assets.upload("image", productImage);

      return client.create({
        _type: "product",
        merchantId,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        price: Number(formData.get("price")),
        category: formData.get("category") as string,
        stock: Number(formData.get("stock")),
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: imageAsset._id,
          },
        },
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", merchantId] });
      setIsAddProductOpen(false);
      setProductImage(undefined);
      setImagePreview(undefined);
      toast({
        title: "Success",
        description: "Product added successfully",
      });
    },
  });
}