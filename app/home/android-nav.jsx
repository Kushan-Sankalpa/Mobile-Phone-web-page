"use client";

import { useEffect, useState } from "react";
import styles from "./android-nav.module.css";
import { fetchBrands } from "@/lib/catalog";

/**
 * Shows active brands as a horizontal nav bar, focused on Android brands.
 */
export default function AndroidNav({ title = "Browse by Android Brand" }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const data = await fetchBrands();
        // OPTIONAL: filter out Apple if you only want Android brands
        const androidOnly = data.filter(
          (b) => b.name.toLowerCase() !== "apple"
        );
        if (alive) setBrands(androidOnly);
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load brands");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className={styles.wrap} aria-label="Android brands navigation">
      <div className={styles.headRow}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}
      {loading ? (
        <div className={styles.loading}>Loading brands…</div>
      ) : (
        <nav className={styles.scroller} aria-label="Android brands">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              className={styles.brand}
              // If you later add brand-specific pages, update this handler:
              // onClick={() => (window.location.href = `/android?brand=${encodeURIComponent(brand.name)}`)}
              onClick={() => {}}
            >
              {brand.imageUrl && (
                <img
                  src={brand.imageUrl}
                  alt={`${brand.name} logo`}
                  className={styles.logo}
                  loading="lazy"
                />
              )}
              <span className={styles.brandName}>{brand.name}</span>
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
