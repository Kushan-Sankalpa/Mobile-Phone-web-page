"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import VideoSlider from "@/components/video-slider"
import Footer from "@/components/footer"
import { CartProvider } from "@/context/cart-context"
import { ThemeProvider } from "@/context/theme-context"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main>
            <VideoSlider />
          </main>
          <Footer />
        </div>
      </CartProvider>
    </ThemeProvider>
  )
}
