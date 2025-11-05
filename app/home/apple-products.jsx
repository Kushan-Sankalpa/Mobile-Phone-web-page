"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./apple-products.module.css";
import { ShoppingCart, Search, Heart } from "lucide-react";
import { fetchApplePhones } from "@/lib/catalog";
import { useCart } from "@/context/cart-context";

function formatRs(n) {
  const num = Number(n || 0);
  return "Rs." + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function deviceTypeFromName(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("iphone")) return "iPhone";
  if (s.includes("ipad")) return "iPad";
  if (s.includes("macbook")) return "MacBook";
  if (s.includes("watch")) return "Watch";
  if (s.includes("airpods")) return "AirPods";
  return "iPhone";
}

function colorCandidates(item) {
  // Try common fields if your admin API exposes colors
  const fromApi =
    item?.colors ||
    item?.availableColors ||
    item?.colourOptions ||
    item?.variants?.flatMap?.((v) => v?.color).filter(Boolean);

  if (Array.isArray(fromApi) && fromApi.length) {
    // Normalize to hex-ish or CSS color names
    return fromApi.slice(0, 6);
  }
  // Nice defaults if nothing provided
  return ["#1f2937", "#e5e7eb", "#f59e0b", "#10b981", "#3b82f6", "#94a3b8"].slice(0, 4);
}

export default function AppleProducts({ title = "Apple Products", limit = 8 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchApplePhones();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Failed to load Apple products");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const list = useMemo(() => items.slice(0, limit), [items, limit]);

  const onAddToCart = (p) => {
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || "/placeholder.svg?height=400&width=400",
      quantity: 1,
    });
  };

  return (
    <section className={styles.wrap} aria-label="Apple products">
      <div className={styles.headRow}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}
      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <div className={styles.grid}>
          {list.map((p) => {
            const img = p.images?.[0] || "/placeholder.svg?height=400&width=400";
            const device = deviceTypeFromName(p.name || p.model);
            const colors = colorCandidates(p);
            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.media}>
                  <img src={img} alt={p.name} className={styles.image} loading="lazy" />
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`Add ${p.name} to cart`}
                      onClick={() => onAddToCart(p)}
                    >
                      <ShoppingCart size={18} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label={`View ${p.name}`}
                      onClick={() => (window.location.href = "/apple")}
                    >
                      <Search size={18} />
                    </button>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      aria-label="Add to wishlist"
                      onClick={() => {}}
                    >
                      <Heart size={18} />
                    </button>
                  </div>
                </div>

                <div className={styles.body}>
                  <h3 className={styles.name}>{p.name}</h3>
                  <p className={styles.sub}>Apple, {device}</p>

                  <div className={styles.swatches} aria-label="Available colors">
                    {colors.map((c, i) => (
                      <span
                        key={i}
                        className={styles.swatch}
                        style={{ backgroundColor: c }}
                        title={typeof c === "string" ? c : `Color ${i + 1}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <div className={styles.price}>{formatRs(p.price)}</div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
