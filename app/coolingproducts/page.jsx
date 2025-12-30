// app/coolingproducts/page.jsx
"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CoolingProductsList from "./partials/coolingproductslist";

export default function CoolingProductsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* navbar is fixed, so push content down */}
      <main className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">
            Cooling Products
          </h1>

          <CoolingProductsList />
        </div>
      </main>
      <Footer />
    </div>
  );
}
