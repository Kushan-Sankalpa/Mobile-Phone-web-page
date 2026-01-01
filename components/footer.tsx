"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowUp, Instagram, Twitter, Facebook, Mail, Phone, MapPin } from "lucide-react"

const MarqueeText = () => {
  const text = "FROZIO GADGETS LK • PREMIUM TECH • SMARTPHONES • AUDIO EQUIPMENT • ";
  
  return (
    <div className="overflow-hidden bg-gradient-to-r from-cyan-500/10 via-cyan-500/5 to-cyan-500/10 py-2 border-y border-white/10">
      <div className="flex whitespace-nowrap">
        <div className="animate-marquee flex shrink-0">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-sm md:text-base font-semibold tracking-wide text-white mx-3">
              {text}
            </span>
          ))}
        </div>
        <div className="animate-marquee flex shrink-0" aria-hidden="true">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-sm md:text-base font-semibold tracking-wide text-white mx-3">
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const footerLinks = {
    support: [
      { label: "Contact Us", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Shipping Info", href: "#" },
      { label: "Returns", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press", href: "#" },
      { label: "Blog", href: "#" },
    ],
    social: [
      { label: "Instagram", href: "#", icon: Instagram },
      { label: "Twitter", href: "#", icon: Twitter },
      { label: "Facebook", href: "#", icon: Facebook },
    ],
  };

  return (
    <footer 
      className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black"
      role="contentinfo"
    >
      <MarqueeText />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">
              Frozio Gadgets <span className="text-cyan-400">LK</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your premier destination for the latest smartphones and audio equipment from top brands worldwide.
            </p>
            <div className="flex gap-4">
              {footerLinks.social.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-cyan-400 hover:text-white transition-all duration-300"
                  aria-label={item.label}
                >
                  <item.icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-cyan-400 transition-colors duration-200 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-cyan-400 flex-shrink-0" />
                <span>info@froziogadgets.lk</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-cyan-400 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>123 Tech Street, Colombo 03, Sri Lanka</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center sm:text-left">
              © 2025 Frozio Gadgets LK. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-cyan-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-cyan-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-cyan-400 text-white shadow-lg shadow-cyan-400/25 flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={20} />
      </button>
    </footer>
  )
}
