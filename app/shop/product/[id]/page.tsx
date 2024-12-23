"use client"

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, ChevronUp, Star } from 'lucide-react'
import { useCart } from '@/hooks/use-cart'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { use } from 'react'
import useFetchProduct from "@/hooks/shop/use-fetch-product"
import {urlFor} from "@/lib/sanity";

interface Props {
  params: Promise<{ id: string }>
}

export default function ProductPage(props: Props) {
  const params = use(props.params)
  const { product, isLoading } = useFetchProduct(params.id)
  const { addToCart } = useCart()
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const sizes = ["SM", "M", "L", "XL", "2XL", "3XL"]

  if (isLoading) {
    return (
        <div className="min-h-screen bg-black">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-96 bg-neutral-800 rounded-lg" />
            </div>
          </div>
        </div>
    )
  }

  if (!product) {
    return (
        <div className="min-h-screen bg-black text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">Product not found</div>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side - Scrollable Images */}
            <div className="lg:w-2/3">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  {product.image.map((img, index) =>
                      img ? (
                          <Card key={index} className="overflow-hidden bg-transparent border-0">
                            <div className="relative aspect-square">
                              <Image
                                  src={urlFor(img?.asset._ref).url()}
                                  alt={`${product.name} - View ${index + 1}`}
                                  fill
                                  className="object-cover"
                              />
                            </div>
                          </Card>
                      ) : null
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right side - Sticky Product Info */}
            <div className="lg:w-1/3">
              <div className="sticky top-8">
                <div className="space-y-6">
                  <div>
                    <div className="text-sm text-neutral-400 uppercase mb-2">
                      {product.category}
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`h-4 w-4 ${
                                    i < product.rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-neutral-600"
                                }`}
                            />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-red-600">
                      ${product.price.toFixed(2)}
                    </span>
                      {product.price && (
                          <span className="text-lg text-neutral-400 line-through">
                        Tshs. {product.price.toFixed(2)}
                      </span>
                      )}
                    </div>
                  </div>

                  {/* Size Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">SIZE</label>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                          <Button
                              key={size}
                              variant={selectedSize === size ? "default" : "outline"}
                              className={`border-neutral-800 hover:border-white ${
                                  selectedSize === size
                                      ? "bg-white text-black"
                                      : "bg-transparent"
                              }`}
                              onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </Button>
                      ))}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <Button
                      size="lg"
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => selectedSize && addToCart(product)}
                      disabled={!selectedSize}
                  >
                    Add to Cart
                  </Button>

                  {/* Description */}
                  <div className="border-t border-neutral-800 pt-4">
                    <button
                        className="flex items-center justify-between w-full text-left"
                        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    >
                      <span className="text-lg font-medium">DESCRIPTION</span>
                      {isDescriptionOpen ? (
                          <ChevronUp className="h-5 w-5" />
                      ) : (
                          <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    <AnimatePresence>
                      {isDescriptionOpen && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                          >
                            <div className="py-4 space-y-4 text-neutral-300">
                              <p>{product.description}</p>
                              {/*{product.details && (*/}
                              {/*    <ul className="list-disc list-inside space-y-2">*/}
                              {/*      {product.details.map((detail: string, index: number) => (*/}
                              {/*          <li key={index}>{detail}</li>*/}
                              {/*      ))}*/}
                              {/*    </ul>*/}
                              {/*)}*/}
                            </div>
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

