"use client"

import { useState, useMemo } from "react"
import ProductGrid from "@/components/product-grid"
import FilterBar from "@/components/filter-bar"
import products from "@/data/products.json"

export default function JBLPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000])
  const [sortBy, setSortBy] = useState("featured")

  const jblProducts = products.jbl

  const filtered = useMemo(() => {
    const result = jblProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      return matchesSearch && matchesPrice
    })

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price)
    }

    return result
  }, [searchTerm, priceRange, sortBy])

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Banner */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">JBL</h1>
          <p className="text-muted-foreground text-lg">Premium audio experiences</p>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* Product Grid */}
        <ProductGrid products={filtered} brand="jbl" />
      </div>
    </div>
  )
}
