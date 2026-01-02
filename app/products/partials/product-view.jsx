// src/app/products/partials/product-view.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./product-view.module.css";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { fetchPublicPhoneById } from "@/lib/catalog";

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

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function isLikelyHexColor(v) {
  return typeof v === "string" && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
}

function normalizeImages(p) {
  const imgs = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
  return imgs.length ? imgs : ["/placeholder.svg?height=700&width=700"];
}

function normalizeStorages(p) {
  const s =
    p?.availableStorages ||
    p?.storageOptionsValues ||
    p?.storages ||
    p?.storageOptions;

  if (Array.isArray(s) && s.length) {
    const nums = s
      .map((x) => {
        if (typeof x === "number") return x;
        if (typeof x === "string") return Number(x);
        if (x && typeof x === "object" && "valueGB" in x) return Number(x.valueGB);
        return NaN;
      })
      .filter((n) => Number.isFinite(n));
    return Array.from(new Set(nums)).sort((a, b) => a - b);
  }

  return [];
}

function normalizeColors(p) {
  const raw = Array.isArray(p?.colors) ? p.colors : [];

  return raw
    .map((v, i) => {
      // populated object
      if (v && typeof v === "object") {
        return {
          id: v._id || v.id || `${i}`,
          name: v.name || "",
          imageUrl: v.imageUrl || "",
          hex: v.hex || "",
        };
      }

      // string
      if (typeof v === "string") {
        return {
          id: `${i}-${v}`,
          name: v,
          imageUrl: "",
          hex: isLikelyHexColor(v) ? v : "",
        };
      }

      return null;
    })
    .filter(Boolean);
}

function StarRow({ value, onChange, size = 18, readOnly = false }) {
  const v = clamp(Number(value || 0), 0, 5);

  return (
    <div className={styles.stars} aria-label={`Rating ${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        const on = idx <= v;
        return (
          <button
            key={idx}
            type="button"
            className={styles.starBtn}
            onClick={() => !readOnly && onChange?.(idx)}
            disabled={readOnly}
            aria-label={readOnly ? `Star ${idx}` : `Set rating to ${idx}`}
          >
            <Star
              size={size}
              className={on ? styles.starOn : styles.starOff}
              fill={on ? "currentColor" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function ProductView({ productId }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState("");

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [selectedColorId, setSelectedColorId] = useState("");
  const [selectedStorage, setSelectedStorage] = useState(null);

  const [qty, setQty] = useState(1);
  const [wish, setWish] = useState(false);

  const [tab, setTab] = useState("description"); // description | additional | reviews

  // reviews
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState("");

  const fileRef = useRef(null);

  const images = useMemo(() => normalizeImages(product), [product]);
  const colors = useMemo(() => normalizeColors(product), [product]);
  const storages = useMemo(() => normalizeStorages(product), [product]);

  const hasDiscount = useMemo(() => {
    if (!product) return false;
    return Number(product.originalPrice) > Number(product.price);
  }, [product]);

  const discountLabel = useMemo(() => {
    if (!product || !hasDiscount) return "";
    if (product.offerType === "percent" && Number(product.offerValue) > 0) {
      return `${Math.round(Number(product.offerValue))}% OFF`;
    }
    if (product.offerType === "amount" && Number(product.offerValue) > 0) {
      return `Rs.${Math.round(Number(product.offerValue))} OFF`;
    }
    return "Discount";
  }, [product, hasDiscount]);

  const inStock = useMemo(() => {
    if (!product) return true;
    if (typeof product.inStock === "boolean") return product.inStock;
    if (typeof product.stockCount === "number") return product.stockCount > 0;
    return true;
  }, [product]);

  // ✅ Load product: show sessionStorage fast, but ALWAYS fetch /phones/:id
  useEffect(() => {
    if (!productId) {
      setLoading(false);
      setProduct(null);
      setError("");
      return;
    }

    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // 1) sessionStorage preview (optional)
        let fromSession = null;
        try {
          const raw = sessionStorage.getItem(`pv:${productId}`);
          if (raw) fromSession = JSON.parse(raw);
        } catch {}

        if (fromSession && alive) {
          setProduct(fromSession);
        }

        // 2) ALWAYS fetch full product by id
        const p = await fetchPublicPhoneById(productId);

        if (alive) {
          if (!p) {
            setError("Product not found.");
            setProduct(null);
          } else {
            setProduct((prev) => ({ ...(prev || {}), ...p }));
          }
        }
      } catch (e) {
        if (alive) setError(e?.message || "Failed to load product");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [productId]);

  // default selections
  useEffect(() => {
    if (!product) return;

    const c0 = colors?.[0];
    if (c0 && !selectedColorId) setSelectedColorId(c0.id);

    const s0 = storages?.[0];
    if (s0 && selectedStorage == null) setSelectedStorage(s0);
  }, [product, colors, storages, selectedColorId, selectedStorage]);

  // wishlist state (localStorage)
  useEffect(() => {
    if (!productId) return;
    try {
      const raw = localStorage.getItem("wishlist:v1");
      const ids = raw ? JSON.parse(raw) : [];
      setWish(Array.isArray(ids) ? ids.includes(productId) : false);
    } catch {}
  }, [productId]);

  const toggleWish = () => {
    if (!productId) return;
    try {
      const raw = localStorage.getItem("wishlist:v1");
      const ids = raw ? JSON.parse(raw) : [];
      const set = new Set(Array.isArray(ids) ? ids : []);
      if (set.has(productId)) set.delete(productId);
      else set.add(productId);
      localStorage.setItem("wishlist:v1", JSON.stringify(Array.from(set)));
      setWish(set.has(productId));
    } catch {
      setWish((v) => !v);
    }
  };

  // Reviews (localStorage per product)
  useEffect(() => {
    if (!productId) return;
    try {
      const raw = localStorage.getItem(`reviews:${productId}`);
      const list = raw ? JSON.parse(raw) : [];
      setReviews(Array.isArray(list) ? list : []);
    } catch {
      setReviews([]);
    }
  }, [productId]);

  const ratingStats = useMemo(() => {
    const list = Array.isArray(reviews) ? reviews : [];
    const count = list.length;
    const sum = list.reduce((a, r) => a + Number(r.rating || 0), 0);
    const avg = count ? sum / count : 0;

    const byStar = [0, 0, 0, 0, 0];
    for (const r of list) {
      const s = clamp(Number(r.rating || 0), 1, 5);
      byStar[s - 1] += 1;
    }
    return { count, avg, byStar };
  }, [reviews]);

  const saveReviews = (next) => {
    setReviews(next);
    try {
      localStorage.setItem(`reviews:${productId}`, JSON.stringify(next));
    } catch {}
  };

  const onPickReviewImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setReviewImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const submitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    const next = [
      {
        id: `${Date.now()}`,
        rating: clamp(reviewRating, 1, 5),
        text: reviewText.trim(),
        image: reviewImage || "",
        createdAt: new Date().toISOString(),
      },
      ...(reviews || []),
    ];

    saveReviews(next);
    setReviewRating(5);
    setReviewText("");
    setReviewImage("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const selectedColor = useMemo(() => {
    return colors.find((c) => c.id === selectedColorId) || null;
  }, [colors, selectedColorId]);

  const addToCart = () => {
    if (!product) return;

    const variantKeyParts = [
      product.id,
      selectedColor?.name || selectedColorId || "",
      selectedStorage != null ? `storage-${selectedStorage}` : "",
    ].filter(Boolean);

    const cartId = variantKeyParts.join("--");

    const labelParts = [product.name];
    if (selectedStorage != null) labelParts.push(`${selectedStorage}GB`);
    if (selectedColor?.name) labelParts.push(selectedColor.name);

    addItem({
      id: cartId,
      name: labelParts.join(" • "),
      price: Number(product.price || 0),
      image: images?.[0] || "/placeholder.svg?height=400&width=400",
      quantity: qty,
    });
  };

  const buyNow = () => {
    addToCart();
    router.push("/cart");
  };

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  if (!productId) {
    return (
      <section className={styles.state}>
        <div className={styles.stateBox}>
          <h2 className={styles.stateTitle}>No product selected</h2>
          <p className={styles.stateText}>Go back and open a product to view details.</p>
          <button className={styles.btnGhost} onClick={() => router.push("/home")}>
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.state}>
        <div className={styles.stateBox}>
          <div className={styles.loader} />
          <p className={styles.stateText}>Loading product…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.state}>
        <div className={styles.stateBox}>
          <h2 className={styles.stateTitle}>Unable to load</h2>
          <p className={styles.stateText}>{error}</p>
          <div className={styles.stateRow}>
            <button className={styles.btnGhost} onClick={() => router.back()}>
              Go Back
            </button>
            <button className={styles.btnPrimary} onClick={() => router.push("/home")}>
              Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!product) return null;

  return (
    <section className={styles.wrap} aria-label="Product view">
      <div className={styles.container}>
        <div className={styles.topGrid}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div className={styles.galleryMain}>
              {hasDiscount && <div className={styles.badge}>{discountLabel}</div>}

              <button
                type="button"
                className={styles.navArrowLeft}
                onClick={prevImg}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>

              <img
                src={images[activeImg]}
                alt={product.name}
                className={styles.mainImage}
                onClick={() => setLightboxOpen(true)}
              />

              <button
                type="button"
                className={styles.navArrowRight}
                onClick={nextImg}
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className={styles.thumbs} aria-label="Image thumbnails">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  className={`${styles.thumbBtn} ${i === activeImg ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Select image ${i + 1}`}
                >
                  <img src={src} alt="" className={styles.thumbImg} />
                </button>
              ))}
            </div>
          </div>

          {/* Right side */}
          <div className={styles.details}>
            <div className={styles.titleRow}>
              <h1 className={styles.title}>{product.name}</h1>

              <button
                type="button"
                className={`${styles.wishBtn} ${wish ? styles.wishOn : ""}`}
                onClick={toggleWish}
                aria-label="Add to wishlist"
                title="Wishlist"
              >
                <Heart size={18} fill={wish ? "currentColor" : "none"} />
              </button>
            </div>

            <div className={styles.meta}>
              <span className={styles.metaItem}>{product.brand}</span>
              <span className={styles.dot}>•</span>
              <span className={styles.metaItem}>{product.model}</span>
              {product.categoryType ? (
                <>
                  <span className={styles.dot}>•</span>
                  <span className={styles.metaItem}>{product.categoryType}</span>
                </>
              ) : null}
            </div>

            <div className={styles.priceBlock}>
              {hasDiscount && (
                <div className={styles.oldPrice}>{formatRs(product.originalPrice)}</div>
              )}
              <div className={styles.newPrice}>{formatRs(product.price)}</div>
            </div>

            {/* Colors */}
            <div className={styles.optBlock}>
              <div className={styles.optLabel}>Available Colors</div>
              <div className={styles.colorsRow}>
                {colors.length ? (
                  colors.map((c) => {
                    const active = c.id === selectedColorId;
                    const showImg = Boolean(c.imageUrl);
                    const showHex = Boolean(c.hex);

                    return (
                      <button
                        key={c.id}
                        type="button"
                        className={`${styles.colorBtn} ${active ? styles.colorActive : ""}`}
                        onClick={() => setSelectedColorId(c.id)}
                        aria-label={c.name ? `Select color ${c.name}` : "Select color"}
                        title={c.name || ""}
                      >
                        {showImg ? (
                          <img src={c.imageUrl} alt="" className={styles.colorImg} />
                        ) : (
                          <span
                            className={styles.colorSwatch}
                            style={{ backgroundColor: showHex ? c.hex : "#e5e7eb" }}
                          />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className={styles.muted}>No colors specified</div>
                )}
              </div>
            </div>

            {/* Storage */}
            <div className={styles.optBlock}>
              <div className={styles.optLabel}>Storage Options</div>
              <div className={styles.storageRow}>
                {storages.length ? (
                  storages.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`${styles.storageBtn} ${
                        selectedStorage === s ? styles.storageActive : ""
                      }`}
                      onClick={() => setSelectedStorage(s)}
                    >
                      {s}GB
                    </button>
                  ))
                ) : (
                  <div className={styles.muted}>No storage options specified</div>
                )}
              </div>
            </div>

            {/* Stock + Warranty */}
            <div className={styles.infoRow}>
              <span className={`${styles.stock} ${inStock ? styles.stockIn : styles.stockOut}`}>
                {inStock ? "In Stock" : "Out of Stock"}
              </span>

              {(product.warrantyType || product.warrantyPeriod) && (
                <span className={styles.warranty}>
                  Warranty: {[product.warrantyType, product.warrantyPeriod].filter(Boolean).join(" ")}
                </span>
              )}
            </div>

            {product.shortDescription ? <p className={styles.shortDesc}>{product.shortDescription}</p> : null}

            {/* Quantity */}
            <div className={styles.qtyRow}>
              <div className={styles.optLabel}>Quantity</div>
              <div className={styles.qtyControl}>
                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => clamp(q - 1, 1, 99))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={16} />
                </button>

                <div className={styles.qtyVal}>{qty}</div>

                <button
                  type="button"
                  className={styles.qtyBtn}
                  onClick={() => setQty((q) => clamp(q + 1, 1, 99))}
                  aria-label="Increase quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.ctaRow}>
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={addToCart}
                disabled={!inStock}
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                type="button"
                className={styles.btnSecondary}
                onClick={buyNow}
                disabled={!inStock}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "description" ? styles.tabActive : ""}`}
            onClick={() => setTab("description")}
          >
            Description
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "additional" ? styles.tabActive : ""}`}
            onClick={() => setTab("additional")}
          >
            Additional Information
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${tab === "reviews" ? styles.tabActive : ""}`}
            onClick={() => setTab("reviews")}
          >
            Reviews
          </button>
        </div>

        {/* Panels */}
        <div className={styles.panel}>
          {tab === "description" && (
            <div className={styles.descGrid}>
              <div className={styles.specCards}>
                <div className={styles.specCard}>
                  <div className={styles.specKey}>Display Size</div>
                  <div className={styles.specVal}>{product.display?.sizeInches || "Not specified"}</div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specKey}>Display Type</div>
                  <div className={styles.specVal}>{product.display?.type || "Not specified"}</div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specKey}>Battery</div>
                  <div className={styles.specVal}>
                    {product.batteryMah ? `${product.batteryMah} mAh` : "Not specified"}
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specKey}>Rear Camera</div>
                  <div className={styles.specVal}>
                    {product.cameras?.rearMP ? `${product.cameras.rearMP} MP` : "Not specified"}
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specKey}>Front Camera</div>
                  <div className={styles.specVal}>
                    {product.cameras?.frontMP ? `${product.cameras.frontMP} MP` : "Not specified"}
                  </div>
                </div>
                <div className={styles.specCard}>
                  <div className={styles.specKey}>SD Card</div>
                  <div className={styles.specVal}>{product.sdCardSupport || "Not specified"}</div>
                </div>
              </div>

              <div className={styles.longDesc}>
                <h3 className={styles.h3}>Long Description</h3>
                <p className={styles.paragraph}>
                  {product.longDescription || "No long description provided."}
                </p>
              </div>
            </div>
          )}

          {tab === "additional" && (
            <div className={styles.tableWrap}>
              <table className={styles.infoTable}>
                <tbody>
                  <tr><td>Brand</td><td>{product.brand || "—"}</td></tr>
                  <tr><td>Category</td><td>{product.categoryType || "—"}</td></tr>
                  <tr><td>Model</td><td>{product.model || "—"}</td></tr>
                  <tr><td>OS</td><td>{product.os || "—"}</td></tr>
                  <tr>
                    <td>Available Storages</td>
                    <td>{storages.length ? storages.map((s) => `${s}GB`).join(", ") : "—"}</td>
                  </tr>
                  <tr><td>RAM</td><td>{product.ramGB ? `${product.ramGB}GB` : "—"}</td></tr>
                  <tr><td>Battery</td><td>{product.batteryMah ? `${product.batteryMah} mAh` : "—"}</td></tr>
                  <tr>
                    <td>Available Colors</td>
                    <td>{colors.length ? colors.map((c) => c.name || c.hex || "Color").join(", ") : "—"}</td>
                  </tr>
                  <tr><td>Display Size</td><td>{product.display?.sizeInches || "—"}</td></tr>
                  <tr><td>Display Type</td><td>{product.display?.type || "—"}</td></tr>
                  <tr><td>Display Resolution</td><td>{product.display?.resolution || "—"}</td></tr>
                  <tr><td>Front Camera</td><td>{product.cameras?.frontMP ? `${product.cameras.frontMP} MP` : "—"}</td></tr>
                  <tr><td>Rear Camera</td><td>{product.cameras?.rearMP ? `${product.cameras.rearMP} MP` : "—"}</td></tr>
                  <tr>
                    <td>Warranty</td>
                    <td>
                      {[product.warrantyType, product.warrantyPeriod].filter(Boolean).join(" ") || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {tab === "reviews" && (
            <div className={styles.reviewsGrid}>
              <div className={styles.reviewSummary}>
                <div className={styles.overallBox}>
                  <div className={styles.overallTop}>
                    <div className={styles.overallScore}>
                      {ratingStats.count ? ratingStats.avg.toFixed(1) : "0.0"}
                    </div>
                    <div className={styles.overallMeta}>
                      <div className={styles.overallLine}>
                        <span className={styles.overallOutOf}>out of 5</span>
                      </div>
                      <StarRow value={Math.round(ratingStats.avg)} readOnly />
                      <div className={styles.overallCount}>
                        {ratingStats.count} review{ratingStats.count === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>

                  <div className={styles.breakdown}>
                    {[5, 4, 3, 2, 1].map((s) => {
                      const count = ratingStats.byStar[s - 1] || 0;
                      const pct = ratingStats.count ? (count / ratingStats.count) * 100 : 0;
                      return (
                        <div key={s} className={styles.barRow}>
                          <div className={styles.barLabel}>{s} star</div>
                          <div className={styles.barTrack}>
                            <div className={styles.barFill} style={{ width: `${pct}%` }} />
                          </div>
                          <div className={styles.barCount}>{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <form className={styles.reviewForm} onSubmit={submitReview}>
                  <h3 className={styles.h3}>Add a Review</h3>

                  <div className={styles.formRow}>
                    <div className={styles.formLabel}>Your Rating</div>
                    <StarRow value={reviewRating} onChange={setReviewRating} />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formLabel}>Review</div>
                    <textarea
                      className={styles.textArea}
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write your review here…"
                      rows={4}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formLabel}>Upload Image</div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className={styles.fileInput}
                      onChange={(e) => onPickReviewImage(e.target.files?.[0])}
                    />
                    {reviewImage ? <img src={reviewImage} alt="" className={styles.reviewPreview} /> : null}
                  </div>

                  <button type="submit" className={styles.btnPrimary}>
                    Submit Review
                  </button>
                </form>
              </div>

              <div className={styles.recentReviews}>
                <h3 className={styles.h3}>Recent Reviews</h3>

                {reviews.length === 0 ? (
                  <div className={styles.muted}>No reviews yet.</div>
                ) : (
                  <div className={styles.reviewList}>
                    {reviews.map((r) => (
                      <div key={r.id} className={styles.reviewCard}>
                        <div className={styles.reviewHead}>
                          <StarRow value={r.rating} readOnly size={16} />
                          <div className={styles.reviewDate}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {r.image ? <img src={r.image} alt="" className={styles.reviewImage} /> : null}

                        <p className={styles.reviewText}>{r.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {lightboxOpen && (
        <div className={styles.lightbox} role="dialog" aria-modal="true">
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <button type="button" className={styles.lightboxPrev} onClick={prevImg} aria-label="Previous image">
            <ChevronLeft size={22} />
          </button>

          <img src={images[activeImg]} alt={product.name} className={styles.lightboxImg} />

          <button type="button" className={styles.lightboxNext} onClick={nextImg} aria-label="Next image">
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </section>
  );
}
