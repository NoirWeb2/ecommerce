"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";

const DEFAULT_NAV_LINKS = [
{ label: "CAMISETAS", href: "/categoria/camisetas" },
{ label: "PANTALONES", href: "/categoria/pantalones" },
{ label: "HOODIES", href: "/categoria/hoodies" },
{ label: "CHAQUETAS", href: "/categoria/chaquetas" },
{ label: "TOTAL LOOKS", href: "/total-looks" },
{ label: "FILOSOFIA", href: "/filosofia" },
{ label: "CONTACTO", href: "/contacto" },
];

interface NavLink { label: string; href: string }
interface HeaderData {
navLinks?: NavLink[];
announcementText?: string;
announcementVisible?: boolean;
}

interface Props {
headerData?: HeaderData | null;
}

export default function Navbar({ headerData }: Props) {
const [mobileOpen, setMobileOpen] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);
const [mounted, setMounted] = useState(false);
const { toggleCart, totalItems } = useCartStore();
const { user } = useAuthStore();

useEffect(() => { setMounted(true); }, []);

// Usa datos del admin o fallback a hardcoded
const navLinks = headerData?.navLinks ?? DEFAULT_NAV_LINKS;
const tickerText = headerData?.announcementText 
  ?? "ENVÍOS GRATIS DESDE $250.000 · UNIQUE VIBES BLACK COLLECTIONS";
const tickerVisible = headerData?.announcementVisible ?? true;
const tickerMsgs = [tickerText, "·", tickerText, "·"];

return (
  <header className="sticky top-0 z-50 bg-noir-black text-white">
    {/* ── Ticker ── */}
    {tickerVisible && (
      <div className="overflow-hidden py-[7px] border-b border-white/[0.08]">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...tickerMsgs, ...tickerMsgs].map((msg, i) => (
            <span key={i} className={`text-[10px] font-medium tracking-[0.2em] uppercase ${
              msg === "·" ? "mx-3 opacity-30" : "mx-4"
            }`}>
              {msg}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* ── Logo + icons ── */}
    <div className="relative flex items-center justify-between px-5 py-[14px]">
      <button className="lg:hidden relative z-10" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
        <Image src="/logo.svg" alt="NOIR LOVERS" width={200} height={29}
          className="brightness-0 invert"
          style={{ width: "clamp(130px, 15vw, 200px)", height: "auto" }} priority />
      </Link>

      <div className="flex items-center gap-[18px] ml-auto">
        <button onClick={() => setSearchOpen(!searchOpen)} className="hover:opacity-60 transition-opacity">
          <Search size={17} strokeWidth={1.8} />
        </button>
        <Link href={user ? "/cuenta" : "/login"} className="hover:opacity-60 transition-opacity">
          <User size={17} strokeWidth={1.8} />
        </Link>
        <button onClick={toggleCart} className="relative hover:opacity-60 transition-opacity">
          <ShoppingBag size={17} strokeWidth={1.8} />
          {mounted && totalItems() > 0 && (
            <span className="absolute -top-[7px] -right-[7px] bg-white text-noir-black text-[9px] w-[16px] h-[16px] rounded-full flex items-center justify-center font-black">
              {totalItems()}
            </span>
          )}
        </button>
      </div>
    </div>

    {/* ── Desktop nav ── */}
    <nav className="hidden lg:flex items-center justify-center gap-[30px] border-t border-white/[0.08] py-[11px]">
      {navLinks.map((link) => (
        <Link key={link.href} href={link.href}
          className="text-[11px] font-normal tracking-[0.13em] uppercase hover:opacity-60 transition-opacity">
          {link.label}
        </Link>
      ))}
    </nav>

    {/* ── Search ── */}
    {searchOpen && (
      <div className="border-t border-white/[0.08] px-5 py-3 flex items-center gap-3">
        <Search size={13} className="opacity-30" />
        <input autoFocus type="text" placeholder="Buscar productos..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-30"
          onBlur={() => setSearchOpen(false)} />
      </div>
    )}

    {/* ── Mobile nav ── */}
    {mobileOpen && (
      <nav className="lg:hidden border-t border-white/[0.08] px-5 py-4 flex flex-col gap-5">
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href}
            onClick={() => setMobileOpen(false)}
            className="text-xs font-medium tracking-widest uppercase">
            {link.label}
          </Link>
        ))}
      </nav>
    )}
  </header>
);
}