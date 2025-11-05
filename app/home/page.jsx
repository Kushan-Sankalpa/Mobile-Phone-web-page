"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VideoSlider from "./video-slider";
import Categories from "./categories";
import AppleProducts from "./apple-products";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VideoSlider />
        <Categories />
        <AppleProducts title="Latest Apple Phones" />
      </main>
      <Footer />
    </div>
  );
}
