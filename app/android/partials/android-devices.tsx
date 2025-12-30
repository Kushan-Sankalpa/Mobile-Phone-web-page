"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../home/apple-products.module.css"; // reuse your existing grid/card CSS
import { ShoppingCart, Search, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import {
  fetchAndroidPhones,
  fetchAndroidPhonesByBrand,
  type StorefrontProduct,
} from "@/lib/catalog";

function formatRs(n: any) {
  const num = Number(n || 0);
  return (
    "Rs." +
    num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

function colorCandidates(item: any) {
  const fromApi =
    item?.colors ||
    item?.availableColors ||
    item?.colourOptions ||
    item?.variants?.flatMap?.((v: any) => v?.color).filter(Boolean);

  if (Array.isArray(fromApi) && fromApi.length) return fromApi.slice(0, 6);

  return ["#1f2937", "#e5e7eb", "#f59e0b", "#10b981", "#3b82f6", "#94a3b8"].slice(
    0,
    4
  );
}

export default function AndroidDevices({
  title = "Android Phones",
  brand = "",
}: {
  title?: string;
  brand?: string;
}) {
  const [items, setItems] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        const data = brand
          ? await fetchAndroidPhonesByBrand(brand)
          : await fetchAndroidPhones();

        if (!alive) return;

        // Extra safety: remove Apple
        const filtered = (data || []).filter(
          (p) => String(p.brand || "").toLowerCase().trim() !== "apple"
        );

        setItems(filtered);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load Android phones");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brand]);

  const list = useMemo(() => items, [items]);

  const onAddToCart = (p: StorefrontProduct) => {
    addItem({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.images?.[0] || "/placeholder.svg?height=400&width=400",
      quantity: 1,
    });
  };

  return (
    <section className={styles.wrap} aria-label="Android devices">
      <div className={styles.headRow}>
        <h2 className={styles.title}>
          {title}
          {brand ? (
            <span style={{ opacity: 0.7, marginLeft: 8, fontSize: 14 }}>
              ({brand})
            </span>
          ) : null}
        </h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : list.length === 0 ? (
        <div className={styles.empty}>
          {brand ? `No ${brand} phones found.` : "No Android phones found."}
        </div>
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
                      onClick={() => (window.location.href = "/android")}
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
                    {p.brand || "Android"}
                    {p.categoryType ? ` • ${p.categoryType}` : ""}
                  </p>

                  <div className={styles.swatches} aria-label="Available colors">
                    {colors.map((c: any, i: number) => (
                      <span
                        key={i}
                        className={styles.swatch}
                        style={{ backgroundColor: c }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>

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
