"use client"

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { client } from '@/lib/sanity';
import Image from 'next/image';

interface SettingsProps {
  merchant: any;
}

export function Settings({ merchant }: SettingsProps) {
  const [logo, setLogo] = useState<File>();
  const [logoPreview, setLogoPreview] = useState<string>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update merchant mutation
  const updateMerchant = useMutation({
    mutationFn: async (formData: FormData) => {
      const updates: any = {
        businessName: formData.get('businessName'),
        whatsappNumber: formData.get('whatsappNumber'),
        description: formData.get('description'),
        paymentDetails: formData.get('paymentDetails'),
        updatedAt: new Date().toISOString(),
      };

      if (logo) {
        const logoAsset = await client.assets.upload('image', logo);
        updates.logo = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: logoAsset._id
          }
        };
      }

      return client
        .patch(merchant._id)
        .set(updates)
        .commit();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['merchant'] });
      toast({
        title: 'Success',
        description: 'Settings updated successfully',
      });
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMerchant.mutate(formData);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">Store Settings</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Business Logo</label>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('logo')?.click()}
            >
              Update Logo
            </Button>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
            />
            <div className="relative h-20 w-20 rounded-lg overflow-hidden">
              <Image
                src={logoPreview || merchant.logo.asset.url}
                alt="Business logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Business Name</label>
          <Input
            name="businessName"
            defaultValue={merchant.businessName}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">WhatsApp Number</label>
          <Input
            name="whatsappNumber"
            defaultValue={merchant.whatsappNumber}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Business Description</label>
          <Textarea
            name="description"
            defaultValue={merchant.description}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Payment Details</label>
          <Textarea
            name="paymentDetails"
            defaultValue={merchant.paymentDetails}
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Card>
  );
}