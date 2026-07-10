"use client"

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useI18n } from '@/components/i18n-provider'

interface SortFilterProps {
    sortBy: string
    onSortChange: (sort: string) => void
}

export function SortFilter({ sortBy, onSortChange }: SortFilterProps) {
    const { t } = useI18n()
    const sortOptions = [
        { value: 'popular', labelKey: 'shop.mostPopular' },
        { value: 'newest', labelKey: 'shop.newest' },
        { value: 'price-low', labelKey: 'shop.priceLow' },
        { value: 'price-high', labelKey: 'shop.priceHigh' },
        { value: 'rating', labelKey: 'shop.highestRated' },
    ] as const

    return (
        <Card className="p-4">
            <h2 className="mb-4 font-semibold">{t("common.sortBy")}</h2>
            <RadioGroup
                value={sortBy}
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
    )
}
