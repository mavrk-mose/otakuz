"use client"

import {use, useState} from 'react'
import { ChevronDown } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/shop/product-grid'
import { FilterSection } from '@/components/shop/filter-section'

interface Props {
    params: Promise<{ title: string }>
}

export default function ShowPage(props: Props) {
    const params = use(props.params)
    const [filters, setFilters] = useState({
        category: [],
        price: [],
    })
    const [sort, setSort] = useState('featured')
    const showTitle = params?.title?.toString().split('-').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="container px-4 py-8">
                {/* Breadcrumb */}
                <div className="text-sm mb-8">
                    <span className="text-gray-400">HOME</span>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="uppercase">{showTitle}</span>
                </div>

                {/* Mobile Filters */}
                <div className="lg:hidden flex items-center justify-between mb-6">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="text-white border-gray-800">
                                Filters
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:w-96 bg-black border-gray-800">
                            <SheetHeader>
                                <SheetTitle className="text-white">Filters</SheetTitle>
                            </SheetHeader>
                            <div className="mt-8">
                                <FilterSection
                                    filters={filters}
                                    setFilters={setFilters}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Select defaultValue={sort} onValueChange={setSort}>
                        <SelectTrigger className="w-[160px] border-gray-800 text-white bg-transparent">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-gray-800">
                            <SelectItem value="featured">Featured</SelectItem>
                            <SelectItem value="price-low">Price: Low to High</SelectItem>
                            <SelectItem value="price-high">Price: High to Low</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <FilterSection
                            filters={filters}
                            setFilters={setFilters}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="hidden lg:flex justify-end mb-6">
                            <Select defaultValue={sort} onValueChange={setSort}>
                                <SelectTrigger className="w-[160px] border-gray-800 text-white bg-transparent">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-gray-800">
                                    <SelectItem value="featured">Featured</SelectItem>
                                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                                    <SelectItem value="newest">Newest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <ProductGrid show={params.title as string} filters={filters} sort={sort} />
                    </div>
                </div>
            </div>
        </div>
    )
}

