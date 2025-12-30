"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../home/apple-products.module.css";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { fetchAccessories } from "@/lib/catalog";

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

function norm(v) {
  return String(v ?? "").trim().toLowerCase();
}

export default function AccessoriesList({ brand = "" }) {
  const { addItem } = useCart();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const title = useMemo(() => {
    if (!brand) return "All Accessories";
    return `${brand} Accessories`;
  }, [brand]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const all = await fetchAccessories();

        if (!alive) return;

        // brand filter (case-insensitive)
        const filtered = brand
          ? (all || []).filter((p) => norm(p.brand) === norm(brand))
          : all || [];

        setItems(filtered);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load accessories");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brand]);

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
    <section className={styles.wrap} aria-label="Accessories catalog">
      <div className={styles.headRow}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No accessories found.</div>
      ) : (
        <div className={styles.grid}>
          {items.map((p) => {
            const img = p.images?.[0] || "/placeholder.svg?height=400&width=400";

            const hasDiscount =
              p.offerType === "percent" &&
              Number(p.offerValue) > 0 &&
              Number(p.originalPrice) > Number(p.price);

            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.media}>
                  {hasDiscount && (
                    <div className={styles.badges}>
                      <span className={styles.badgeOff}>
                        {Math.round(Number(p.offerValue))}% OFF
                      </span>
                    </div>
                  )}

                  <img
                    src={img}
                    alt={p.name}
                    className={styles.image}
                    loading="lazy"
                  />

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
                      aria-label="Wishlist"
                      onClick={() => {}}
                    >
                      <Heart size={18} />
                    </button>
                  </div>
                </div>

                <div className={styles.body}>
                  <h3 className={styles.name}>{p.name}</h3>
                  <p className={styles.sub}>
                    {p.brand} {p.categoryType ? `• ${p.categoryType}` : ""}
                  </p>

                  {!!p.specs?.length && (
                    <ul className={styles.specs}>
                      {p.specs.slice(0, 3).map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  )}

                  <div className={styles.priceWrap}>
                    {hasDiscount && (
                      <div className={styles.oldPrice}>
                        {formatRs(p.originalPrice)}
                      </div>
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
