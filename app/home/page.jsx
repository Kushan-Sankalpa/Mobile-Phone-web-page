"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import VideoSlider from "./video-slider";
import Categories from "./categories";
import AppleProducts from "./apple-products";
import AndroidVedio from "./androidvedio";
import AndroidNav from "./android-nav";
import JblVedio from "./jblvedio";

import Speakers from "./Speakers";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <VideoSlider />
        <Categories />
        <AppleProducts title="Latest Apple Phones" />

        <AndroidVedio title="Android Highlights" src="/media/android1.mp4" />
        <br />
        <AndroidNav title="Shop by Android Brand" />
        <JblVedio />

        
        <Speakers />
      </main>
      <Footer />
    </div>
  );
}
