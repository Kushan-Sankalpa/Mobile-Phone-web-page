"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PreOwnedDevices from "./partials/preowned_devices";

export default function PreOwnedDevicesPage() {
  const sp = useSearchParams();
  const type = sp.get("type") || ""; // iphone | ipad | macbook | apple-watch | airpods | android-phone | android-watch | android-tablet

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <PreOwnedDevices type={type} />
      </main>
      <Footer />
    </div>
  );
}
