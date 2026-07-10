"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/components/i18n-provider"

interface FilterSectionProps {
    filters: {
        category: string[]
        price: string[]
    }
    setFilters: (filters: any) => void
}

export function FilterSection({ filters, setFilters }: FilterSectionProps) {
    const { t } = useI18n()
    const styles = [
        { id: 'tshirts', labelKey: 'shop.tshirts' },
        { id: 'hoodies', labelKey: 'shop.hoodies' },
        { id: 'accessories', labelKey: 'shop.accessories' },
        { id: 'home', labelKey: 'shop.home' },
        { id: 'collectibles', labelKey: 'shop.collectibles' },
    ] as const

    const priceRanges = [
        { id: 'under-25', labelKey: 'shop.under25' },
        { id: '25-50', labelKey: 'shop.from25to50' },
        { id: '50-100', labelKey: 'shop.from50to100' },
        { id: 'over-100', labelKey: 'shop.over100' },
    ] as const

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
                <h3 className="text-lg font-semibold mb-4">{t("shop.style")}</h3>
                <div className="space-y-3">
                    {styles.map((style) => (
                        <div key={style.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={style.id}
                                checked={filters.category.includes(style.id)}
                                onCheckedChange={() => toggleFilter('style', style.id)}
                                className="border-input"
                            />
                            <Label
                                htmlFor={style.id}
                                className="text-sm text-foreground"
                            >
                                {t(style.labelKey)}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-4">{t("common.price")}</h3>
                <div className="space-y-3">
                    {priceRanges.map((range) => (
                        <div key={range.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={range.id}
                                checked={filters.price.includes(range.id)}
                                onCheckedChange={() => toggleFilter('price', range.id)}
                                className="border-input"
                            />
                            <Label
                                htmlFor={range.id}
                                className="text-sm text-foreground"
                            >
                                {t(range.labelKey)}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
