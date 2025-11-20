// components/navbar.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useTheme } from "@/context/theme-context";
import { Menu, X, ShoppingCart, Moon, Sun } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/apple", label: "Apple" },
    { href: "/android", label: "Android" },
    { href: "/jbl", label: "JBL" },
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-black text-white ${
        isScrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/home"
            className="flex items-center gap-2 font-bold text-xl text-white focus:outline-none focus:ring-2 focus:ring-primary rounded-lg px-2 py-1"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
              P
            </div>
            <span className="hidden sm:inline">PhoneShop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 ${
                  isActive(link.href)
                    ? "text-white border-b-2 border-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Theme toggle (still affects the rest of the site, navbar stays black) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary hover:bg-white/10 text-white"
              aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <Link
              href="/cart"
              className="relative p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary hover:bg-white/10 text-white"
              aria-label={`Shopping cart with ${items.length} items`}
            >
              <ShoppingCart size={20} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary hover:bg-white/10 text-white"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive(link.href)
                    ? "text-white bg-white/10"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
