"use client";

import { useEffect, useState } from "react";
import styles from "./Coolers.module.css";
import { fetchCoolers } from "@/lib/catalog";

function formatRs(n) {
  const num = Number(n || 0);
  return (
    "Rs." +
    num.toLocaleString("en-LK", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  );
}

export default function Coolers() {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const items = await fetchCoolers();
        if (!alive) return;

        setProducts(items);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load coolers");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className={styles.coolersSection}>
      <div className={styles.inner}>
        <header className={styles.coolersHeader}>
          <h2 className={styles.coolersTitle}>Coolers</h2>
        </header>

        {error && <p className={styles.coolersEmpty}>{error}</p>}

        {loading ? (
          <p className={styles.coolersEmpty}>Loading coolers…</p>
        ) : (
          <div className={styles.coolersGrid}>
            {products.length === 0 ? (
              <p className={styles.coolersEmpty}>No coolers yet.</p>
            ) : (
              products.map((p) => {
                const original = Number(p.originalPrice ?? p.price ?? 0);
                const price = Number(p.price ?? 0);

                const hasDiscount =
                  Number.isFinite(original) &&
                  Number.isFinite(price) &&
                  original > price;

                const discountPct =
                  hasDiscount && original > 0
                    ? Math.round(((original - price) / original) * 100)
                    : 0;

                const discountLabel = hasDiscount ? `${discountPct}% OFF` : "";

                return (
                  <article key={p.id} className={styles.coolerCard}>
                    <div className={styles.coolerCardImage}>
                      {/* ✅ Discount badge */}
                      {hasDiscount && (
                        <div className={styles.badges}>
                          <span className={styles.badgeOff}>
                            {discountLabel}
                          </span>
                        </div>
                      )}

                      <img
                        src={
                          p.images?.[0] ||
                          "/placeholder.svg?height=400&width=400"
                        }
                        alt={p.name}
                        loading="lazy"
                      />
                    </div>

                    <div className={styles.coolerCardBody}>
                      <h3 className={styles.coolerCardTitle}>{p.name}</h3>
                      <p className={styles.coolerCardSubtitle}>
                        Coolers, {p.brand}
                      </p>

                      {p.colors?.length > 0 && (
                        <div
                          className={styles.coolerCardSwatches}
                          aria-label="Available colors"
                        >
                          {p.colors.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              className={styles.coolerCardSwatch}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      )}

                      {/* ✅ Old + New price */}
                      <div className={styles.coolerCardPriceRow}>
                        {hasDiscount ? (
                          <>
                            <span className={styles.coolerCardPriceOld}>
                              {formatRs(original)}
                            </span>
                            <span className={styles.coolerCardPrice}>
                              {formatRs(price)}
                            </span>
                          </>
                        ) : (
                          <span className={styles.coolerCardPrice}>
                            {formatRs(price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </section>
  );
}
