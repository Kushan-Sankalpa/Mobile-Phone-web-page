// components/home/categories.jsx
"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Speaker,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import styles from "./categories.module.css";

const CATEGORIES = [
  { key: "smartphones", label: "Smart Phones", href: "/android", icon: Smartphone, theme: "smartphones" },
  { key: "tablets",     label: "Tablets",      href: "/android", icon: Tablet,     theme: "tablets" },
  { key: "laptops",     label: "Laptops",      href: "#",        icon: Laptop,     theme: "laptops" },
  { key: "earbuds",     label: "Ear Buds",     href: "/jbl",     icon: Headphones, theme: "earbuds" },
  { key: "watches",     label: "Smart Watches",href: "/apple",   icon: Watch,      theme: "watches" },
  { key: "partyboxes",  label: "Party Boxes",  href: "/jbl",     icon: Speaker,    theme: "partyboxes" },
];

export default function Categories() {
  const trackRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  // Update arrow enable/disable on scroll/resize
  const updateButtons = () => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 8);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 8);
  };

  useEffect(() => {
    updateButtons();
    const el = trackRef.current;
    if (!el) return;

    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const scrollByAmount = (direction = 1) => {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <section className={styles.wrap} aria-labelledby="home-categories-heading">
      <div className={styles.header}>
        <h2 id="home-categories-heading" className={styles.title}>
          Shop by Category
        </h2>
        <p className={styles.subtitle}>Find what you love—quickly.</p>
      </div>

      <div className={styles.slider}>
        <button
          className={`${styles.navBtn} ${styles.left}`}
          onClick={() => scrollByAmount(-1)}
          aria-label="Scroll categories left"
          disabled={!canLeft}
        >
          <ChevronLeft className={styles.navIcon} />
        </button>

        <div
          ref={trackRef}
          className={styles.track}
          role="listbox"
          aria-label="Categories carousel"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") scrollByAmount(-1);
            if (e.key === "ArrowRight") scrollByAmount(1);
          }}
        >
          {CATEGORIES.map(({ key, label, href, icon: Icon, theme }) => (
            <Link
              key={key}
              href={href}
              className={`${styles.card} ${styles[`g_${theme}`]}`}
              role="option"
              aria-label={label}
            >
              <div className={styles.cardInner}>
                <div className={styles.iconWrap} aria-hidden="true">
                  <Icon className={styles.icon} />
                </div>
                <h3 className={styles.cardTitle}>{label}</h3>
                <span className={styles.cta}>Browse →</span>
              </div>
            </Link>
          ))}
        </div>

        <button
          className={`${styles.navBtn} ${styles.right}`}
          onClick={() => scrollByAmount(1)}
          aria-label="Scroll categories right"
          disabled={!canRight}
        >
          <ChevronRight className={styles.navIcon} />
        </button>
      </div>
    </section>
  );
}
