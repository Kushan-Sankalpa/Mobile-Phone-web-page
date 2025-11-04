// app/home/page.jsx
"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VideoSlider from "@/components/video-slider";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VideoSlider />
      </main>
      <Footer />
    </div>
  );
}
