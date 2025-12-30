"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SpeakersList from "./partials/speakerslist";

export default function SpeakersPage() {
  const sp = useSearchParams();
  const brand = sp.get("brand") || ""; // optional

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <SpeakersList brand={brand} />
      </main>
      <Footer />
    </div>
  );
}
