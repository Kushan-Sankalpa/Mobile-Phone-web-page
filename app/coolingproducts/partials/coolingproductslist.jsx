"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchCoolers } from "@/lib/catalog";

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function CoolingProductsList() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await fetchCoolers();
        if (!alive) return;
        setItems(data || []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load cooling products");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = String(q || "").trim().toLowerCase();
    if (!term) return items;

    return (items || []).filter((p) => {
      const brand = String(p?.brand || "").toLowerCase();
      const name = String(p?.name || p?.model || "").toLowerCase();
      const model = String(p?.model || "").toLowerCase();
      const cat = String(p?.categoryType || "").toLowerCase();
      return (
        brand.includes(term) ||
        name.includes(term) ||
        model.includes(term) ||
        cat.includes(term)
      );
    });
  }, [items, q]);

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-9 w-full bg-white/10 rounded" />
          <div className="h-48 w-full bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
        {err}
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search cooling products..."
          className="w-full max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-white/25"
        />
        <div className="text-sm text-white/70">
          {filtered.length} item{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-sm text-white/70">No cooling products found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const img =
              Array.isArray(p?.images) && p.images.length
                ? p.images[0]
                : "/placeholder.svg?height=400&width=400";

            const price = Number(p?.price || 0);
            const original = Number(p?.originalPrice || 0);
            const showOriginal = original > 0 && original > price;

            return (
              <div
                key={p.id}
                className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition"
              >
                <div className="aspect-square bg-black/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={p?.name || p?.model || "Cooling Product"}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-3 space-y-1">
                  <div className="text-xs text-white/60">
                    {p?.brand || "Unknown Brand"}
                  </div>

                  <div className="text-sm font-semibold line-clamp-2">
                    {p?.name || p?.model}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <div className="text-sm font-bold">
                      Rs {formatMoney(price)}
                    </div>

                    {/* ✅ FIXED: use && instead of broken ternary */}
                    {showOriginal && (
                      <div className="text-xs text-white/50 line-through">
                        Rs {formatMoney(original)}
                      </div>
                    )}
                  </div>

                  {/* Optional: go to product page later */}
                  <Link
                    href="#"
                    className="inline-block mt-2 text-xs text-white/70 hover:text-white"
                    onClick={(e) => e.preventDefault()}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
