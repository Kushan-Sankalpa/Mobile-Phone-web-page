"use client";

import styles from "./apple-categories.module.css";

const cards = [
  {
    key: "macbook",
    title: "Macbook",
    href: "/apple/macbook", // change if you have different routes
    image: "/media/macbook-placeholder.png", // TODO: replace with real image
    alt: "Apple Macbook",
    areaClass: styles.macbookCard,
  },
  {
    key: "ipad",
    title: "iPad",
    href: "/apple/ipad",
    image: "/media/ipad-placeholder.png",
    alt: "Apple iPad",
    areaClass: styles.ipadCard,
  },
  {
    key: "watch",
    title: "Apple Watch",
    href: "/apple/watch",
    image: "/media/apple-watch-placeholder.png",
    alt: "Apple Watch",
    areaClass: styles.watchCard,
  },
  {
    key: "airpods",
    title: "AirPods",
    href: "/apple/airpods",
    image: "/media/airpods-placeholder.png",
    alt: "Apple AirPods",
    areaClass: styles.airpodsCard,
  },
];

export default function AppleCategories() {
  return (
    <section className={styles.section} aria-label="Apple categories">
      <div className={styles.inner}>
        <h2 className={styles.heading}>Apple Categories</h2>

        <div className={styles.grid}>
          {cards.map((card) => (
            <article
              key={card.key}
              className={`${styles.card} ${card.areaClass}`}
            >
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <button
                  type="button"
                  className={styles.viewAll}
                  onClick={() => (window.location.href = card.href)}
                >
                  <span>VIEW ALL</span>
                  <span className={styles.chevron}>›</span>
                </button>
              </div>

              <div className={styles.imageWrap}>
                <img
                  src={card.image}
                  alt={card.alt}
                  className={styles.image}
                  loading="lazy"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
