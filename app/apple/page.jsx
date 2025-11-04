"use client";

import { useEffect, useMemo, useState } from "react";
import ProductGrid from "@/components/product-grid";
import FilterBar from "@/components/filter-bar";
import { fetchApplePhones } from "@/lib/catalog";

export default function ApplePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 3000]);
  const [sortBy, setSortBy] = useState("featured");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchApplePhones();
        if (mounted) setItems(data);
      } catch (e) {
        setErr(e?.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const result = items.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesPrice;
    });
    if (sortBy === "price-low")  result.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [items, searchTerm, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">Apple</h1>
          <p className="text-muted-foreground text-lg">Premium devices designed to delight</p>
        </div>

        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {err && <div className="text-red-500 mb-4">{err}</div>}
        {loading ? (
          <div className="py-16 text-center">Loading…</div>
        ) : (
          <ProductGrid products={filtered} brand="apple" />
        )}
      </div>
    </div>
  );
}
