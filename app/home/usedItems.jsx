"use client";

import { useEffect, useState } from "react";
import styles from "./usedItems.module.css";
import { fetchUsedItems } from "@/lib/catalog";

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

export default function UsedItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await fetchUsedItems();
        if (alive) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load used devices");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const list = items.filter((p) => {
    const status = (p.deviceStatus || "").toLowerCase().trim();
    return status === "used";
  });

  return (
    <section className={styles.wrap} aria-label="Used Devices">
      <div className={styles.headRow}>
        <h2 className={styles.title}>Used Devices</h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.loading}>Loading used devices…</div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>No used devices available right now.</div>
      ) : (
        <div className={styles.grid}>
          {list.map((p) => {
            const img = p.images?.[0] || "/placeholder.svg?height=400&width=400";

            const brand = p.brand || "Unknown";
            const cat = p.categoryType || "Device";

            const original = Number(p.originalPrice ?? p.price ?? 0);
            const price = Number(p.price ?? 0);

            // ✅ discount detection WITHOUT relying on offerType
            const hasDiscount = Number.isFinite(original) && Number.isFinite(price) && original > price;

            const discountPct =
              hasDiscount && original > 0
                ? Math.round(((original - price) / original) * 100)
                : 0;

            const discountLabel = hasDiscount ? `${discountPct}% OFF` : "";

            return (
              <article key={p.id} className={styles.card}>
                <div className={styles.media}>
                  {hasDiscount && (
                    <div className={styles.badges}>
                      <span className={styles.badgeOff}>{discountLabel}</span>
                    </div>
                  )}

                  <img
                    src={img}
                    alt={p.name}
                    className={styles.image}
                    loading="lazy"
                  />
                </div>

                <div className={styles.body}>
                  <h3 className={styles.name}>{p.name}</h3>
                  <p className={styles.sub}>
                    {brand} • {cat} • Used
                  </p>

                  <div className={styles.priceWrap}>
                    {hasDiscount && (
                      <div className={styles.oldPrice}>{formatRs(original)}</div>
                    )}
                    <div className={styles.newPrice}>{formatRs(price)}</div>
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
