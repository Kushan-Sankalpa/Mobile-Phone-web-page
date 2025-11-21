"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./Speakers.module.css";
import { fetchSpeakerBrands, fetchSpeakers } from "@/lib/catalog";

export default function Speakers() {
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeBrand, setActiveBrand] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load brands + speakers once (similar to AndroidNav)
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

        // auto-select first brand (e.g. JBL)
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

  const filtered = useMemo(() => {
    if (!activeBrand) return products;
    return products.filter((p) => p.brandId === activeBrand.id);
  }, [products, activeBrand]);

  const activeName = activeBrand?.name ?? "this brand";

  return (
    <section className={styles.speakersSection}>
      <div className={styles.inner}>
        {/* Title row */}
        <header className={styles.speakersHeader}>
          <h2 className={styles.speakersTitle}>Portable Speakers</h2>
        </header>

        {/* Brand navbar like JBL / MARSHALL / BASEUS / … */}
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
              filtered.map((p) => (
                <article key={p.id} className={styles.speakerCard}>
                  {/* Image */}
                  <div className={styles.speakerCardImage}>
                    <img src={p.images?.[0]} alt={p.name} loading="lazy" />
                  </div>

                  {/* Text + details */}
                  <div className={styles.speakerCardBody}>
                    <h3 className={styles.speakerCardTitle}>{p.name}</h3>
                    <p className={styles.speakerCardSubtitle}>
                      Portable Speakers, {p.brand}, Sounds
                    </p>

                    {/* Color dots (like screenshot bottom left) */}
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

                    {/* Price row (old + new) */}
                    <div className={styles.speakerCardPriceRow}>
                      {p.originalPrice && p.originalPrice > p.price ? (
                        <>
                          <span className={styles.speakerCardPriceOld}>
                            Rs.{p.originalPrice.toLocaleString("en-LK")}
                          </span>
                          <span className={styles.speakerCardPrice}>
                            Rs.{p.price.toLocaleString("en-LK")}
                          </span>
                        </>
                      ) : (
                        <span className={styles.speakerCardPrice}>
                          Rs.{p.price.toLocaleString("en-LK")}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}
