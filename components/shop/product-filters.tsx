"use client"

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'figures', label: 'Figures & Statues' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'manga', label: 'Manga & Books' },
    { value: 'home', label: 'Home & Decor' },
    { value: 'collectibles', label: 'Collectibles' },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
  ];

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-4">Categories</h3>
        <RadioGroup
          defaultValue="all"
          onValueChange={onCategoryChange}
          className="space-y-2"
        >
          {categories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <RadioGroupItem value={category.value} id={category.value} />
              <Label htmlFor={category.value}>{category.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Card>

      <Card className="p-4">
        <h3 className="font-semibold mb-4">Price Range</h3>
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
        <h3 className="font-semibold mb-4">Sort By</h3>
        <RadioGroup
          defaultValue="popular"
          onValueChange={onSortChange}
          className="space-y-2"
        >
          {sortOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </Card>
    </div>
  );
}