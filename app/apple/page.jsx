"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AppleProducts from "./partials/appleproducts";

export default function ApplePage() {
  const sp = useSearchParams();
  const category = sp.get("category") || "";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {/* navbar is fixed, so push content down */}
      <main className="pt-16">
        <AppleProducts title="Apple Products" category={category} />
      </main>
      <Footer />
    </div>
  );
}
