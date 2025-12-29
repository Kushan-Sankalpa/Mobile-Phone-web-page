"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { fetchBrands, fetchSpeakerBrands } from "@/lib/catalog";
import { ShoppingCart, Search, ChevronDown, X } from "lucide-react";

type Brand = { id: string; name: string; imageUrl?: string };

type NavItem = {
  label: string;
  href?: string;
  items?: { label: string; href: string }[];
};

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { items } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<string | null>(
    null
  );
  const [hoverDesktop, setHoverDesktop] = useState<string | null>(null);
  const [openMobileSection, setOpenMobileSection] = useState<string | null>(
    null
  );

  const [androidBrands, setAndroidBrands] = useState<Brand[]>([]);
  const [speakerBrands, setSpeakerBrands] = useState<Brand[]>([]);
  const [brandErr, setBrandErr] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const navRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setOpenMobileSection(null);
    setOpenDesktopDropdown(null);
    setHoverDesktop(null);
    setSearchOpen(false);
  }, [pathname]);

  // Click outside closes dropdown + search
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const el = navRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setOpenDesktopDropdown(null);
        setHoverDesktop(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ESC closes everything
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDesktopDropdown(null);
        setHoverDesktop(null);
        setSearchOpen(false);
        setIsOpen(false);
        setOpenMobileSection(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Clear hover close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Load brands for dropdowns
  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setBrandErr(null);

        const [allBrands, spBrands] = await Promise.all([
          fetchBrands(),
          fetchSpeakerBrands(),
        ]);

        if (!alive) return;

        const androidOnly = (allBrands || []).filter(
          (b: any) => (b?.name || "").toLowerCase().trim() !== "apple"
        );

        setAndroidBrands(androidOnly);
        setSpeakerBrands(spBrands || []);
      } catch (e: any) {
        if (!alive) return;
        setBrandErr(e?.message || "Failed to load brands");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const allAccessoryBrands = useMemo(() => {
    const names = new Map<string, Brand>();

    for (const b of androidBrands) {
      const key = (b.name || "").trim().toLowerCase();
      if (key) names.set(key, b);
    }
    for (const b of speakerBrands) {
      const key = (b.name || "").trim().toLowerCase();
      if (key) names.set(key, b);
    }

    return Array.from(names.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [androidBrands, speakerBrands]);
const isActive = (href?: string) => {
  if (!href) return false;

  // Home should be active ONLY on "/"
  if (href === "/") return pathname === "/";

  return pathname.startsWith(href);
};


  // Dropdown link definitions
  const appleDropdown = [
    { label: "iPhone", href: "/apple?category=iphone" },
    { label: "iPad", href: "/apple?category=ipad" },
    { label: "Apple Watch", href: "/apple?category=watch" },
    { label: "Mac", href: "/apple?category=mac" },
    { label: "AirPods", href: "/apple?category=airpods" },
    { label: "AirTags", href: "/apple?category=airtags" },
    { label: "Accessories", href: "/accessories?brand=Apple" },
  ];

  const preOwnedDropdown = [
    { label: "Pre-Owned iPhone", href: "/pre-owned?type=iphone" },
    { label: "Pre-Owned iPads", href: "/pre-owned?type=ipad" },
    { label: "Pre-Owned MacBooks", href: "/pre-owned?type=macbook" },
    { label: "Pre-Owned Apple Watches", href: "/pre-owned?type=apple-watch" },
    { label: "Pre-Owned AirPods", href: "/pre-owned?type=airpods" },
    { label: "Pre-Owned Android Phones", href: "/pre-owned?type=android-phone" },
    { label: "Pre-Owned Android Watches", href: "/pre-owned?type=android-watch" },
    { label: "Pre-Owned Android Tablets", href: "/pre-owned?type=android-tablet" },
  ];

  const androidDropdown = androidBrands.map((b) => ({
    label: b.name,
    href: `/android?brand=${encodeURIComponent(b.name)}`,
  }));

  const speakersDropdown = speakerBrands.map((b) => ({
    label: b.name,
    href: `/speakers?brand=${encodeURIComponent(b.name)}`,
  }));

  const accessoriesDropdown = allAccessoryBrands.map((b) => ({
    label: b.name,
    href: `/accessories?brand=${encodeURIComponent(b.name)}`,
  }));

  const navItems: NavItem[] = [
    { label: "Home", href: "/home" },
    { label: "Apple", items: appleDropdown },
    { label: "Android", items: androidDropdown },
    { label: "Pre-Owned", items: preOwnedDropdown },
    { label: "Speakers", items: speakersDropdown },
    { label: "Accessories", items: accessoriesDropdown },
  ];

  const submitSearch = () => {
    const q = searchQ.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const handleDropdownEnter = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDesktopDropdown(label);
    setHoverDesktop(label);
  };

  const handleDropdownLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDesktopDropdown(null);
      setHoverDesktop(null);
    }, 150);
  };

  const toggleMobileSection = (label: string) => {
    setOpenMobileSection((prev) => (prev === label ? null : label));
  };

  return (
    <>
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cx(
          "fixed top-0 w-full z-50 transition-all duration-500",
          "bg-[hsl(var(--navbar-bg))] text-[hsl(var(--navbar-text))]",
          isScrolled ? "shadow-[0_4px_30px_rgba(0,0,0,0.3)]" : "shadow-none"
        )}
      >
        <div ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded-lg px-2 py-1"
            >
              <div className="w-9 h-9 bg-[hsl(var(--navbar-text))] rounded-full flex items-center justify-center text-[hsl(var(--navbar-bg))] text-sm font-bold transition-transform duration-300 group-hover:scale-110">
                P
              </div>
              <span className="hidden sm:inline font-semibold text-lg tracking-tight transition-opacity duration-300 group-hover:opacity-80">
                PhoneShop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const hasDropdown =
                  Array.isArray(item.items) && item.items.length > 0;

                if (!hasDropdown) {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.label}
                      href={item.href || "#"}
                      className={cx(
                        "nav-link px-4 py-2 text-sm font-medium transition-all duration-300",
                        "text-[hsl(var(--navbar-text-muted))] hover:text-[hsl(var(--navbar-hover))]",
                        active && "active text-[hsl(var(--navbar-hover))]"
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                }

                const isOpenDrop = openDesktopDropdown === item.label;
                const isHovering = hoverDesktop === item.label;

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => handleDropdownEnter(item.label)}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <button
                      type="button"
                      className={cx(
                        "nav-link inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-300",
                        "text-[hsl(var(--navbar-text-muted))] hover:text-[hsl(var(--navbar-hover))]",
                        (isOpenDrop || isHovering) &&
                          "active text-[hsl(var(--navbar-hover))]"
                      )}
                      aria-haspopup="menu"
                      aria-expanded={isOpenDrop}
                    >
                      {item.label}
                      <ChevronDown
                        size={14}
                        className={cx("chevron", isOpenDrop && "open")}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    <div
                      role="menu"
                      className={cx(
                        "dropdown-menu absolute left-0 top-full pt-2",
                        isOpenDrop && "open"
                      )}
                      onMouseEnter={() => handleDropdownEnter(item.label)}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="w-56 rounded-xl border border-[hsl(var(--navbar-dropdown-border))] bg-[hsl(var(--navbar-dropdown-bg))] shadow-2xl overflow-hidden">
                        <div className="max-h-[60vh] overflow-auto py-2">
                          {item.items!.map((sub, idx) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              role="menuitem"
                              className="dropdown-item block px-4 py-2.5 text-sm transition-all duration-200 text-[hsl(var(--navbar-text-muted))] hover:text-[hsl(var(--navbar-hover))] hover:bg-[hsl(var(--navbar-dropdown-hover))] hover:pl-5"
                              style={{ animationDelay: `${idx * 30}ms` }}
                              onClick={() => {
                                setOpenDesktopDropdown(null);
                                setHoverDesktop(null);
                              }}
                            >
                              {sub.label}
                            </Link>
                          ))}

                          {brandErr && (
                            <div className="px-4 pt-2 text-xs text-red-300">
                              {brandErr}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={searchOpen ? () => setSearchOpen(false) : openSearch}
                  className="icon-btn p-2.5 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  aria-label={searchOpen ? "Close search" : "Open search"}
                >
                  {searchOpen ? <X size={20} /> : <Search size={20} />}
                </button>

                <div
                  className={cx(
                    "search-container flex items-center",
                    searchOpen && "open"
                  )}
                >
                  <div className="flex items-center gap-2 bg-[hsl(var(--navbar-dropdown-bg))] border border-[hsl(var(--navbar-dropdown-border))] rounded-lg px-3 py-1.5">
                    <input
                      ref={searchRef}
                      value={searchQ}
                      onChange={(e) => setSearchQ(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitSearch();
                        if (e.key === "Escape") setSearchOpen(false);
                      }}
                      placeholder="Search products..."
                      className="w-full bg-transparent outline-none text-sm placeholder:text-[hsl(var(--navbar-text-muted))]"
                      aria-label="Search products"
                    />
                  </div>
                </div>
              </div>

              {/* Cart */}
              <Link
                href="/cart"
                className="icon-btn relative p-2.5 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label={`Shopping cart with ${items.length} items`}
              >
                <ShoppingCart size={20} />
                {items.length > 0 && (
                  <span className="cart-badge absolute -top-0.5 -right-0.5 bg-[hsl(var(--navbar-text))] text-[hsl(var(--navbar-bg))] text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle (same animation style) */}
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="icon-btn md:hidden p-2.5 rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Toggle menu"
                aria-expanded={isOpen}
              >
                <div className="relative w-5 h-5">
                  <span
                    className={cx(
                      "absolute left-0 w-5 h-0.5 bg-current transition-all duration-300",
                      isOpen ? "top-2.5 rotate-45" : "top-1"
                    )}
                  />
                  <span
                    className={cx(
                      "absolute left-0 top-2.5 w-5 h-0.5 bg-current transition-all duration-300",
                      isOpen ? "opacity-0 scale-0" : "opacity-100 scale-100"
                    )}
                  />
                  <span
                    className={cx(
                      "absolute left-0 w-5 h-0.5 bg-current transition-all duration-300",
                      isOpen ? "top-2.5 -rotate-45" : "top-4"
                    )}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={cx(
              "mobile-menu md:hidden border-t border-[hsl(var(--navbar-dropdown-border))]",
              isOpen && "open"
            )}
          >
            <div className="py-4">
              {/* Mobile Search */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 bg-[hsl(var(--navbar-dropdown-bg))] border border-[hsl(var(--navbar-dropdown-border))] rounded-xl px-4 py-3">
                  <Search
                    size={18}
                    className="text-[hsl(var(--navbar-text-muted))]"
                  />
                  <input
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitSearch();
                    }}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent outline-none text-sm placeholder:text-[hsl(var(--navbar-text-muted))]"
                    aria-label="Search products"
                  />
                  <button
                    type="button"
                    onClick={submitSearch}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[hsl(var(--navbar-text))] text-[hsl(var(--navbar-bg))] font-semibold transition-transform duration-200 hover:scale-105 active:scale-95"
                  >
                    Go
                  </button>
                </div>
              </div>

              {/* Mobile Nav Items */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const hasDropdown =
                    Array.isArray(item.items) && item.items.length > 0;

                  if (!hasDropdown) {
                    return (
                      <Link
                        key={item.label}
                        href={item.href || "#"}
                        className={cx(
                          "block px-4 py-3 text-sm font-medium transition-all duration-300 rounded-lg mx-2",
                          isActive(item.href)
                            ? "text-[hsl(var(--navbar-hover))] bg-[hsl(var(--navbar-dropdown-hover))]"
                            : "text-[hsl(var(--navbar-text-muted))] hover:text-[hsl(var(--navbar-hover))] hover:bg-[hsl(var(--navbar-dropdown-hover))]"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  }

                  const sectionOpen = openMobileSection === item.label;

                  return (
                    <div key={item.label} className="mx-2">
                      <button
                        type="button"
                        className={cx(
                          "w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300",
                          sectionOpen
                            ? "text-[hsl(var(--navbar-hover))] bg-[hsl(var(--navbar-dropdown-hover))]"
                            : "text-[hsl(var(--navbar-text-muted))] hover:text-[hsl(var(--navbar-hover))] hover:bg-[hsl(var(--navbar-dropdown-hover))]"
                        )}
                        onClick={() => toggleMobileSection(item.label)}
                        aria-expanded={sectionOpen}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={cx("chevron", sectionOpen && "open")}
                        />
                      </button>

                      <div className={cx("mobile-accordion", sectionOpen && "open")}>
                        <div className="pt-1 pb-2 space-y-0.5">
                          {item.items!.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className="block px-6 py-2.5 text-sm transition-all duration-200 text-[hsl(var(--navbar-text-muted))] hover:text-[hsl(var(--navbar-hover))] hover:pl-8 rounded-lg"
                              onClick={() => {
                                setIsOpen(false);
                                setOpenMobileSection(null);
                              }}
                            >
                              {sub.label}
                            </Link>
                          ))}

                          {brandErr && (
                            <div className="px-6 py-2 text-xs text-red-300">
                              {brandErr}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Self-contained CSS (same behavior/animations as your example) */}
      <style jsx global>{`
        :root {
          /* black-only theme */
          --navbar-bg: 0 0% 0%;
          --navbar-text: 0 0% 100%;
          --navbar-text-muted: 0 0% 68%;
          --navbar-hover: 0 0% 100%;

          --navbar-dropdown-bg: 0 0% 7%;
          --navbar-dropdown-border: 0 0% 18%;
          --navbar-dropdown-hover: 0 0% 12%;
        }

        /* underline hover/active like example */
        .nav-link {
          position: relative;
          border-radius: 10px;
        }
        .nav-link::after {
          content: "";
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 4px;
          height: 2px;
          border-radius: 999px;
          background: hsl(var(--navbar-hover));
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 280ms ease;
          opacity: 0.95;
        }
        .nav-link:hover::after,
        .nav-link.active::after {
          transform: scaleX(1);
        }

        .chevron {
          transition: transform 250ms ease;
        }
        .chevron.open {
          transform: rotate(180deg);
        }

        /* dropdown open/close animation */
        .dropdown-menu {
          opacity: 0;
          transform: translateY(10px);
          pointer-events: none;
          transition: opacity 220ms ease, transform 220ms ease;
        }
        .dropdown-menu.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* dropdown item stagger animation */
        .dropdown-item {
          animation: dropdownItemIn 260ms ease both;
          opacity: 0;
          transform: translateX(-6px);
        }
        @keyframes dropdownItemIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* icon button hover */
        .icon-btn:hover {
          background: hsl(var(--navbar-dropdown-hover));
          transform: translateY(-1px);
        }
        .icon-btn:active {
          transform: translateY(0);
        }

        /* desktop search expand */
        .search-container {
          width: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateX(-6px);
          transition: width 280ms ease, opacity 220ms ease, transform 220ms ease;
        }
        .search-container.open {
          width: 260px;
          opacity: 1;
          transform: translateX(0);
          margin-left: 8px;
        }
        @media (max-width: 640px) {
          .search-container.open {
            width: 210px;
          }
        }

        /* mobile menu animation */
        .mobile-menu {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 320ms ease, opacity 220ms ease;
        }
        .mobile-menu.open {
          max-height: 1000px;
          opacity: 1;
        }

        /* mobile accordion */
        .mobile-accordion {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(-4px);
          transition: max-height 300ms ease, opacity 220ms ease, transform 220ms ease;
        }
        .mobile-accordion.open {
          max-height: 900px;
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}
