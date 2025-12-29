"use client";

import { useEffect, useState, useMemo } from "react";
import styles from "./android-nav.module.css";
import { fetchBrands, fetchAndroidPhonesByBrand } from "@/lib/catalog";
import { ShoppingCart, Search, Heart } from "lucide-react";
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
  if (s.includes("watch")) return "Watch";
  if (s.includes("tablet") || s.includes("tab")) return "Tablet";
  if (s.includes("buds") || s.includes("ear") || s.includes("pod"))
    return "Earbuds";
  return "Phone";
}

function colorCandidates(item) {
  const fromApi =
    item?.colors ||
    item?.availableColors ||
    item?.colourOptions ||
    item?.variants?.flatMap?.((v) => v?.color).filter(Boolean);

  if (Array.isArray(fromApi) && fromApi.length) {
    return fromApi.slice(0, 6);
  }
  return ["#1f2937", "#e5e7eb", "#f59e0b", "#10b981", "#3b82f6", "#94a3b8"].slice(
    0,
    4
  );
}

export default function AndroidNav({ title = "Browse by Android Brand" }) {
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [brandErr, setBrandErr] = useState(null);

  const [activeBrand, setActiveBrand] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productErr, setProductErr] = useState(null);

  const { addItem } = useCart();

  // Load brands once
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoadingBrands(true);
        const data = await fetchBrands();
        const androidOnly = data.filter((b) => b.name.toLowerCase() !== "apple");
        if (!alive) return;
        setBrands(androidOnly);

        // auto-select first brand
        if (androidOnly.length > 0) {
          setActiveBrand(androidOnly[0]);
        }
      } catch (e) {
        if (!alive) return;
        setBrandErr(e?.message || "Failed to load brands");
      } finally {
        if (!alive) return;
        setLoadingBrands(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // When active brand changes, load its products
  useEffect(() => {
    if (!activeBrand) return;

    let alive = true;
    (async () => {
      try {
        setLoadingProducts(true);
        setProductErr(null);
        const products = await fetchAndroidPhonesByBrand(activeBrand.name);
        if (!alive) return;
        setItems(products);
      } catch (e) {
        if (!alive) return;
        setProductErr(e?.message || "Failed to load products");
      } finally {
        if (!alive) return;
        setLoadingProducts(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeBrand]);

  const onAddToCart = (p) => {
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || "/placeholder.svg?height=400&width=400",
      quantity: 1,
    });
  };

  const list = useMemo(() => items, [items]);

  return (
    <section className={styles.wrap} aria-label="Android brands navigation">
      <header className={styles.headRow}>
        <h2 className={styles.title}>{title}</h2>
      </header>

      {brandErr && <div className={styles.error}>{brandErr}</div>}

      {loadingBrands ? (
        <div className={styles.loading}>Loading brands…</div>
      ) : (
        <>
          <nav className={styles.scroller} aria-label="Android brands">
            {brands.map((brand) => {
              const isActive = activeBrand && activeBrand.id === brand.id;
              return (
                <button
                  key={brand.id}
                  type="button"
                  className={
                    isActive
                      ? `${styles.brand} ${styles.brandActive}`
                      : styles.brand
                  }
                  onClick={() => setActiveBrand(brand)}
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
              );
            })}
          </nav>

          {activeBrand && (
            <>
              <p className={styles.subtitle}>Showing {activeBrand.name} phones</p>

              {productErr && <div className={styles.error}>{productErr}</div>}

              {loadingProducts ? (
                <div className={styles.loading}>Loading products…</div>
              ) : (
                <div
                  key={activeBrand.id}
                  className={`${styles.grid} ${styles.gridAnimated}`}
                >
                  {list.map((p) => {
                    const img =
                      p.images?.[0] || "/placeholder.svg?height=400&width=400";
                    const device = deviceTypeFromName(p.name || p.model);
                    const colors = colorCandidates(p);

                    // ✅ Discount logic (don’t depend on offerType; just compare prices)
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
                      <article key={p.id} className={styles.card}>
                        <div className={styles.media}>
                          {/* ✅ Badge */}
                          {hasDiscount && (
                            <div className={styles.badges}>
                              <span className={styles.badgeOff}>
                                {discountLabel}
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
                              aria-label={`View ${p.name}`}
                              onClick={() =>
                                (window.location.href = `/android?brand=${encodeURIComponent(
                                  activeBrand.name
                                )}&model=${encodeURIComponent(p.model)}`)
                              }
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
                            {p.brand}, {device}
                          </p>

                          <div
                            className={styles.swatches}
                            aria-label="Available colors"
                          >
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

                          {/* ✅ Old price + New price */}
                          <div className={styles.priceWrap}>
                            {hasDiscount && (
                              <div className={styles.oldPrice}>
                                {formatRs(original)}
                              </div>
                            )}
                            <div className={styles.newPrice}>{formatRs(price)}</div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  );
}
