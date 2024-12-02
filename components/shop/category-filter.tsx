"use client"

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'figures', label: 'Figures & Statues' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'manga', label: 'Manga & Books' },
    { value: 'home', label: 'Home & Decor' },
    { value: 'collectibles', label: 'Collectibles' },
  ];

  return (
    <Card className="p-4">
      <h2 className="font-semibold mb-4">Categories</h2>
      <RadioGroup
        value={selectedCategory}
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
  );
}