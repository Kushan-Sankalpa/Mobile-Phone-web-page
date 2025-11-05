"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VideoSlider from "./video-slider";
import Categories from "./categories";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className={styles.pageMain}>
        <VideoSlider />
        <Categories />
      </main>
      <Footer />
    </>
  );
}
