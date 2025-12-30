"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AccessoriesList from "./partials/accessorieslist";

export default function AccessoriesPage() {
  const sp = useSearchParams();
  const brand = sp.get("brand") || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <AccessoriesList brand={brand} />
      </main>
      <Footer />
    </div>
  );
}
