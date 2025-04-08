"use client";

import { useState } from "react";
import { toast } from "sonner";
import { client } from "@/lib/sanity";
import { nanoid } from "nanoid";
import { z } from "zod";

export function useCreateMerchant() {
  const [isLoading, setIsLoading] = useState(false);

  const merchantSchema = z.object({
    businessName: z.string().min(1, "Business name is required"),
    whatsappNumber: z
      .string()
      .regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format"),
    description: z.string().min(1, "Description is required"),
    logo: z.instanceof(File, { message: "Business logo is required" }),
    paymentDetails: z.string().optional(),
  });

  type MerchantData = z.infer<typeof merchantSchema>;

  const createMerchant = async (data: MerchantData) => {
    setIsLoading(true);

    try {
      const logoAsset = await client.assets.upload("image", data.logo);

      const merchantId = nanoid();
      const merchant = await client.create({
        _type: "merchant",
        _id: merchantId,
        businessName: data.businessName,
        whatsappNumber: data.whatsappNumber,
        description: data.description,
        logo: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: logoAsset._id,
          },
        },
        paymentDetails: data.paymentDetails,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast.success("Merchant account created successfully");

      return merchant;
    } catch (error) {
      console.error("Error creating merchant:", error);
      toast.error("Failed to create merchant account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMerchant,
    isLoading
  };
}
