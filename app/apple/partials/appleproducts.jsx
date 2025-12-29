"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../home/apple-products.module.css"; // reuse your existing styles
import { ShoppingCart, Search, Heart } from "lucide-react";
import { fetchApplePhones } from "@/lib/catalog";
import { useCart } from "@/context/cart-context";

function formatRs(n) {
  const num = Number(n || 0);
  return (
    "Rs." +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function deviceTypeFromName(name) {
  const s = (name || "").toLowerCase();
  if (s.includes("iphone")) return "iphone";
  if (s.includes("ipad")) return "ipad";
  if (s.includes("macbook") || s.includes("imac") || s.includes("mac")) return "mac";
  if (s.includes("watch")) return "watch";
  if (s.includes("airpods")) return "airpods";
  if (s.includes("airtag")) return "airtags";
  return "iphone";
}

function normalizeCategory(cat) {
  const c = (cat || "").toLowerCase().trim();
  if (!c) return "";
  // allow both "mac" and "macbook" etc.
  if (c === "macbook") return "mac";
  return c;
}

function colorCandidates(item) {
  const fromApi =
    item?.colors ||
    item?.availableColors ||
    item?.colourOptions ||
    item?.variants?.flatMap?.((v) => v?.color).filter(Boolean);

  if (Array.isArray(fromApi) && fromApi.length) return fromApi.slice(0, 6);

  return ["#1f2937", "#e5e7eb", "#f59e0b", "#10b981", "#3b82f6", "#94a3b8"].slice(
    0,
    4
  );
}

export default function AppleProducts({ title = "Apple Products", category = "" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const { addItem } = useCart();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await fetchApplePhones();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load Apple products");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const list = useMemo(() => {
    const cat = normalizeCategory(category);

    return (items || []).filter((p) => {
      const brandOk = (p.brand || "").toLowerCase().trim() === "apple";
      const statusOk = (p.deviceStatus || "").toLowerCase().trim() === "not used";

      if (!brandOk || !statusOk) return false;

      if (!cat) return true;

      const t = deviceTypeFromName(p.name || p.model);
      return t === cat;
    });
  }, [items, category]);

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
        <h2 className={styles.title}>
          {title}
          {category ? (
            <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 14 }}>
              ({category})
            </span>
          ) : null}
        </h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>No Apple (Not used) products found.</div>
      ) : (
        <div className={styles.grid}>
          {list.map((p) => {
            const img = p.images?.[0] || "/placeholder.svg?height=400&width=400";
            const colors = colorCandidates(p);

            const hasDiscount =
              p.offerType === "percent" &&
              Number(p.offerValue) > 0 &&
              Number(p.originalPrice) > Number(p.price);

            const discountLabel = hasDiscount
              ? `${Math.round(Number(p.offerValue))}% OFF`
              : "";

            const categoryLabel = p.categoryType || deviceTypeFromName(p.name || p.model);

            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.media}>
                  {hasDiscount && (
                    <div className={styles.badges}>
                      <span className={styles.badgeOff}>{discountLabel}</span>
                    </div>
                  )}

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

                  <p className={styles.sub}>
                    {p.brand || "Apple"}, {categoryLabel}
                    {" • Not used"}
                  </p>

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

                  <div className={styles.priceWrap}>
                    {hasDiscount && (
                      <div className={styles.oldPrice}>{formatRs(p.originalPrice)}</div>
                    )}
                    <div className={styles.newPrice}>{formatRs(p.price)}</div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
