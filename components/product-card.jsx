"use client"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"

export default function ProductCard({ product, onViewDetails, brand }) {
  const { addItem } = useCart()

  const brandColors = {
    apple: "border-black dark:border-white",
    android: "border-green-500",
    jbl: "border-orange-500",
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    })
  }

  return (
    <div
      className={`bg-card rounded-lg border-2 ${brandColors[brand]} overflow-hidden hover:shadow-lg transition-shadow focus-within:ring-2 focus-within:ring-primary`}
    >
      <div className="relative h-48 bg-secondary">
        <img
          src={product.images[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{product.model}</p>
        <h3 className="font-bold text-lg mb-2">{product.name}</h3>

        <ul className="text-xs text-muted-foreground mb-4 space-y-1">
          {product.specs.slice(0, 2).map((spec, i) => (
            <li key={i}>• {spec}</li>
          ))}
        </ul>

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold">${product.price}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-3 py-2 rounded-lg transition-colors font-medium text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          >
            View Details
          </button>
          <button
            onClick={handleAddToCart}
            className="bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
