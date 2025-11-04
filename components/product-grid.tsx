"use client"

import { useState } from "react"
import ProductCard from "@/components/product-card"
import ProductModal from "@/components/product-modal"

interface Product {
  id: string
  brand: string
  name: string
  model: string
  price: number
  specs: string[]
  images: string[]
}

interface ProductGridProps {
  products: Product[]
  brand: string
}

export default function ProductGrid({ products, brand }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={() => setSelectedProduct(product)}
            brand={brand}
          />
        ))}
      </div>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    </>
  )
}
