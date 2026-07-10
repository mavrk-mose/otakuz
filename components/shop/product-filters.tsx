"use client"

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { useI18n } from '@/components/i18n-provider';

interface ProductFiltersProps {
  onCategoryChange: (category: string) => void;
  onPriceRangeChange: (range: [number, number]) => void;
  onSortChange: (sort: string) => void;
}

export function ProductFilters({
  onCategoryChange,
  onPriceRangeChange,
  onSortChange,
}: ProductFiltersProps) {
  const { t } = useI18n();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const categories = [
    { value: 'all', labelKey: 'shop.allProducts' },
    { value: 'clothing', labelKey: 'shop.clothing' },
    { value: 'figures', labelKey: 'shop.figures' },
    { value: 'accessories', labelKey: 'shop.accessories' },
    { value: 'manga', labelKey: 'shop.mangaBooks' },
    { value: 'home', labelKey: 'shop.homeDecor' },
    { value: 'collectibles', labelKey: 'shop.collectibles' },
  ] as const;

  const sortOptions = [
    { value: 'popular', labelKey: 'shop.mostPopular' },
    { value: 'newest', labelKey: 'shop.newest' },
    { value: 'price-low', labelKey: 'shop.priceLow' },
    { value: 'price-high', labelKey: 'shop.priceHigh' },
    { value: 'rating', labelKey: 'shop.highestRated' },
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">{t("common.categories")}</h3>
        <RadioGroup
          defaultValue="all"
          onValueChange={onCategoryChange}
          className="space-y-2"
        >
          {categories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <RadioGroupItem value={category.value} id={category.value} />
              <Label htmlFor={category.value}>{t(category.labelKey)}</Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">{t("shop.priceRange")}</h3>
        <Slider
          defaultValue={[0, 1000]}
          max={1000}
          step={10}
          value={priceRange}
          onValueChange={(value) => {
            setPriceRange(value as [number, number]);
            onPriceRangeChange(value as [number, number]);
          }}
          className="mt-2"
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">{t("common.sortBy")}</h3>
        <RadioGroup
          defaultValue="popular"
          onValueChange={onSortChange}
          className="space-y-2"
        >
          {sortOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{t(option.labelKey)}</Label>
            </div>
          ))}
        </RadioGroup>
      </Card>
    </div>
  );
}
