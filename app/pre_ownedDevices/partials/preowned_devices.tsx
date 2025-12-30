"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../home/apple-products.module.css";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import {
  fetchUsedItems,
  fetchUsedAppleItemsByCategoryTypes,
  fetchUsedAndroidItemsByCategoryTypes,
  fetchUsedItemsByCategoryTypes,
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

const TYPE_CONFIG: Record<
  string,
  {
    title: string;
    scope: "all" | "apple" | "android";
    categoryTypes: string[];
  }
> = {
  // ---- Apple used ----
  iphone: {
    title: "Pre-Owned iPhones",
    scope: "apple",
    categoryTypes: ["iphone", "iPhone", "IPHONE"],
  },
  ipad: {
    title: "Pre-Owned iPads",
    scope: "apple",
    categoryTypes: ["ipad", "iPad", "IPAD"],
  },
  macbook: {
    title: "Pre-Owned MacBooks",
    scope: "apple",
    categoryTypes: ["macbook", "MacBook", "MACBOOK", "mac book", "Mac Book"],
  },
  "apple-watch": {
    title: "Pre-Owned Apple Watches",
    scope: "apple",
    categoryTypes: ["apple watch", "Apple Watch", "APPLE WATCH", "watch", "Watch"],
  },
  airpods: {
    title: "Pre-Owned AirPods",
    scope: "apple",
    categoryTypes: ["airpods", "AirPods", "AIRPODS"],
  },

  // ---- Android used ----
  "android-phone": {
    title: "Pre-Owned Android Phones",
    scope: "android",
    // you requested "Android Smartphone" and also accept variations
    categoryTypes: [
      "Android Smartphone",
      "android smartphone",
      "ANDROID SMARTPHONE",
      "android phone",
      "Android Phone",
      "smartphone",
      "Smartphone",
    ],
  },
  "android-watch": {
    title: "Pre-Owned Android Watches",
    scope: "android",
    categoryTypes: [
      "Smart watches",
      "smart watches",
      "SMART WATCHES",
      "smart watch",
      "Smart Watch",
      "watch",
      "Watch",
    ],
  },
  "android-tablet": {
    title: "Pre-Owned Android Tablets",
    scope: "android",
    categoryTypes: [
      "Android tab",
      "android tab",
      "ANDROID TAB",
      "android tablet",
      "Android Tablet",
      "tablet",
      "Tablet",
    ],
  },
};

function norm(v: any) {
  return String(v ?? "").trim().toLowerCase();
}

function categoryMatches(p: StorefrontProduct, allowed: string[]) {
  const c = norm(p.categoryType);
  return allowed.some((x) => norm(x) === c);
}

export default function PreOwnedDevices({ type = "" }: { type?: string }) {
  const { addItem } = useCart();
  const [items, setItems] = useState<StorefrontProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const cfg = TYPE_CONFIG[type];

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr(null);
        setLoading(true);

        // view all (no type)
        if (!type) {
          const all = await fetchUsedItems();
          if (!alive) return;
          setItems(all || []);
          return;
        }

        // type exists
        if (!cfg) {
          // unknown type -> just show all used
          const all = await fetchUsedItems();
          if (!alive) return;
          setItems(all || []);
          return;
        }

        let data: StorefrontProduct[] = [];

        if (cfg.scope === "apple") {
          data = await fetchUsedAppleItemsByCategoryTypes(cfg.categoryTypes);
        } else if (cfg.scope === "android") {
          data = await fetchUsedAndroidItemsByCategoryTypes(cfg.categoryTypes);
        } else {
          data = await fetchUsedItemsByCategoryTypes(cfg.categoryTypes);
        }

        if (!alive) return;
        setItems(data || []);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to load pre-owned devices");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [type, cfg]);

  const title = useMemo(() => {
    if (!type) return "All Pre-Owned Devices";
    if (!cfg) return "All Pre-Owned Devices";
    return cfg.title;
  }, [type, cfg]);

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
    <section className={styles.wrap} aria-label="Pre-owned devices">
      <div className={styles.headRow}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      {err && <div className={styles.error}>{err}</div>}

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : items.length === 0 ? (
        <div className={styles.empty}>No items found.</div>
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
