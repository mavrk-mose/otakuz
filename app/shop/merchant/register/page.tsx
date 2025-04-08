"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { client } from '@/lib/sanity';

export default function MerchantRegistrationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logo, setLogo] = useState<File>();
  const [logoPreview, setLogoPreview] = useState<string>();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!logo) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      const logoAsset = await client.assets.upload('image', logo);
      if (!logoAsset) {
        throw new Error('Failed to upload logo');
      }

      const merchant = await client.create({
        _type: 'merchant',
        businessName: formData.get('businessName'),
        whatsappNumber: formData.get('whatsappNumber'),
        description: formData.get('description'),
        logo: {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: logoAsset._id
          }
        },
        paymentDetails: formData.get('paymentDetails'),
        createdAt: new Date().toISOString(),
      });

      router.push(`/shop/merchant/dashboard`);
    } catch (error) {
      console.error('Error registering merchant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card className="p-6">
        <h1 className="text-3xl font-bold mb-6">Merchant Registration</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Logo</label>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Logo
              </Button>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
                required
              />
            </div>
            {logoPreview && (
              <div className="relative h-32 w-32 rounded-lg overflow-hidden">
                <Image
                  src={logoPreview}
                  alt="Business logo preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name</label>
            <Input name="businessName" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp Business Number</label>
            <Input
              name="whatsappNumber"
              type="tel"
              placeholder="+1234567890"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Business Description</label>
            <Textarea
              name="description"
              placeholder="Tell us about your business..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Details</label>
            <Textarea
              name="paymentDetails"
              placeholder="Enter your payment information..."
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register as Merchant'}
          </Button>
        </form>
      </Card>
    </div>
  );
}