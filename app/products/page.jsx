// src/app/products/page.jsx
"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ProductView from "./partials/product-view";

export default function ProductsPage() {
  const sp = useSearchParams();
  const id = sp.get("id") || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <ProductView productId={id} />
      </main>
      <Footer />
    </div>
  );
}
