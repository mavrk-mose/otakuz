"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FilterSectionProps {
    filters: {
        category: string[]
        price: string[]
    }
    setFilters: (filters: any) => void
}

export function FilterSection({ filters, setFilters }: FilterSectionProps) {
    const styles = [
        { id: 'tshirts', label: 'T-Shirts' },
        { id: 'hoodies', label: 'Hoodies & Sweatshirts' },
        { id: 'accessories', label: 'Accessories' },
        { id: 'home', label: 'Home' },
        { id: 'collectibles', label: 'Collectibles' },
    ]

    const priceRanges = [
        { id: 'under-25', label: 'Under $25' },
        { id: '25-50', label: '$25 - $50' },
        { id: '50-100', label: '$50 - $100' },
        { id: 'over-100', label: 'Over $100' },
    ]

    const toggleFilter = (type: 'style' | 'price', value: string) => {
        setFilters((prev: any) => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter((item: string) => item !== value)
                : [...prev[type], value]
        }))
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-4">Style</h3>
                <div className="space-y-3">
                    {styles.map((style) => (
                        <div key={style.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={style.id}
                                checked={filters.category.includes(style.id)}
                                onCheckedChange={() => toggleFilter('style', style.id)}
                                className="border-gray-600"
                            />
                            <Label
                                htmlFor={style.id}
                                className="text-sm text-gray-300"
                            >
                                {style.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">Price</h3>
                <div className="space-y-3">
                    {priceRanges.map((range) => (
                        <div key={range.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={range.id}
                                checked={filters.price.includes(range.id)}
                                onCheckedChange={() => toggleFilter('price', range.id)}
                                className="border-gray-600"
                            />
                            <Label
                                htmlFor={range.id}
                                className="text-sm text-gray-300"
                            >
                                {range.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

