"use client"

import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface SortFilterProps {
    sortBy: string
    onSortChange: (sort: string) => void
}

export function SortFilter({ sortBy, onSortChange }: SortFilterProps) {
    const sortOptions = [
        { value: 'popular', label: 'Most Popular' },
        { value: 'newest', label: 'Newest Arrivals' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
    ]

    return (
        <Card className="p-4 bg-neutral-900 border-neutral-800">
            <h2 className="font-semibold mb-4 text-white">Sort By</h2>
            <RadioGroup
                value={sortBy}
                onValueChange={onSortChange}
                className="space-y-2"
            >
                {sortOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} className="border-neutral-700" />
                        <Label htmlFor={option.value} className="text-neutral-300">{option.label}</Label>
                    </div>
                ))}
            </RadioGroup>
        </Card>
    )
}

