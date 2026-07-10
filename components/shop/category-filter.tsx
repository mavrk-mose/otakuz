"use client"

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useI18n } from '@/components/i18n-provider'

interface CategoryFilterProps {
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    const { t } = useI18n()
    const categories = [
        { value: 'all', labelKey: 'shop.allProducts' },
        { value: 'clothing', labelKey: 'shop.clothing' },
        { value: 'figures', labelKey: 'shop.figures' },
        { value: 'accessories', labelKey: 'shop.accessories' },
        { value: 'manga', labelKey: 'shop.mangaBooks' },
        { value: 'home', labelKey: 'shop.homeDecor' },
        { value: 'collectibles', labelKey: 'shop.collectibles' },
    ] as const

    return (
        <Card className="p-4">
            <h2 className="mb-4 font-semibold">{t("common.categories")}</h2>
            <RadioGroup
                value={selectedCategory}
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
    )
}
