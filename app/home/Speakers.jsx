"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Speakers.module.css";
import { fetchSpeakerBrands, fetchSpeakers } from "@/lib/catalog";

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

export default function Speakers() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load brands + speakers once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [brandData, productData] = await Promise.all([
          fetchSpeakerBrands(),
          fetchSpeakers(),
        ]);

        if (!alive) return;

        setBrands(brandData);
        setProducts(productData);

        if (brandData.length > 0) {
          setActiveBrand(brandData[0]);
        }
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to load speakers");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // filter by brand NAME
  const filtered = useMemo(() => {
    if (!activeBrand) return products;

    const activeName = (activeBrand.name || "").toLowerCase().trim();

    return products.filter(
      (p) => (p.brand || "").toLowerCase().trim() === activeName
    );
  }, [products, activeBrand]);

  const activeName = activeBrand?.name ?? "this brand";

  return (
    <section className={styles.speakersSection}>
      <div className={styles.inner}>
        <header className={styles.speakersHeader}>
          <h2 className={styles.speakersTitle}>Portable Speakers</h2>
        </header>

        {brands.length > 0 && (
          <nav className={styles.speakersTabs} aria-label="Speaker brands">
            {brands.map((brand) => {
              const isActive = activeBrand && activeBrand.id === brand.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  className={
                    isActive
                      ? `${styles.speakersTab} ${styles.speakersTabActive}`
                      : styles.speakersTab
                  }
                  onClick={() => setActiveBrand(brand)}
                >
                  {brand.name}
                </button>
              );
            })}
          </nav>
        )}

        {error && <p className={styles.speakersEmpty}>{error}</p>}

        {loading ? (
          <p className={styles.speakersEmpty}>Loading speakers…</p>
        ) : (
          <div className={styles.speakersGrid}>
            {filtered.length === 0 ? (
              <p className={styles.speakersEmpty}>
                No speakers for {activeName} yet.
              </p>
            ) : (
              filtered.map((p) => {
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
                  <article key={p.id} className={styles.speakerCard}>
                    <div className={styles.speakerCardImage}>
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

                    <div className={styles.speakerCardBody}>
                      <h3 className={styles.speakerCardTitle}>{p.name}</h3>
                      <p className={styles.speakerCardSubtitle}>
                        Portable Speakers, {p.brand}, Sounds
                      </p>

                      {p.colors?.length > 0 && (
                        <div
                          className={styles.speakerCardSwatches}
                          aria-label="Available colors"
                        >
                          {p.colors.slice(0, 5).map((c, i) => (
                            <span
                              key={i}
                              className={styles.speakerCardSwatch}
                              style={{ backgroundColor: c }}
                              title={c}
                            />
                          ))}
                        </div>
                      )}

                      {/* ✅ Old + New price */}
                      <div className={styles.speakerCardPriceRow}>
                        {hasDiscount ? (
                          <>
                            <span className={styles.speakerCardPriceOld}>
                              {formatRs(original)}
                            </span>
                            <span className={styles.speakerCardPrice}>
                              {formatRs(price)}
                            </span>
                          </>
                        ) : (
                          <span className={styles.speakerCardPrice}>
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
