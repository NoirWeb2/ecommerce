"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Truck, Clock, RefreshCw } from "lucide-react";
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartSidebar from "@/components/store/CartSidebar";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import type { HomePageData } from "@/lib/page-settings";

// ─── Product data ────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: "1",  name: "Noir T-Shirt — Black Edition",  slug: "noir-tshirt-black",     price: 189000, comparePrice: null,   image: "/tshirt-front.png",  hover: "/tshirt-model.png",  badge: "ITEM",  sizes: ["S","M","L","XL"] },
  { id: "2",  name: "Noir T-Shirt — Back Print",     slug: "noir-tshirt-back",      price: 199000, comparePrice: null,   image: "/tshirt-back.png",   hover: "/tshirt-front.png",  badge: "ITEM",  sizes: ["S","M","L","XL"] },
  { id: "3",  name: "Noir T-Shirt — Modelo",         slug: "noir-tshirt-modelo",    price: 189000, comparePrice: null,   image: "/tshirt-model.png",  hover: "/tshirt-front.png",  badge: "ITEM",  sizes: ["S","M","L","XL"] },
  { id: "4",  name: "Noir T-Shirt — Classic Fit",    slug: "noir-tshirt-classic",   price: 179000, comparePrice: 210000, image: "/tshirt-front.png",  hover: "/tshirt-back.png",   badge: "ITEM",  sizes: ["S","M","L","XL"] },
  { id: "5",  name: "Noir T-Shirt — Shadow Back",    slug: "noir-tshirt-shadow",    price: 199000, comparePrice: null,   image: "/tshirt-back.png",   hover: "/tshirt-model.png",  badge: "ITEM",  sizes: ["S","M","L","XL"] },
  { id: "6",  name: "Noir T-Shirt — Stealth",        slug: "noir-tshirt-stealth",   price: 189000, comparePrice: null,   image: "/tshirt-front.png",  hover: "/tshirt-back.png",   badge: "NUEVO", sizes: ["S","M","L","XL"] },
  { id: "7",  name: "Noir T-Shirt — Signature",      slug: "noir-tshirt-signature", price: 195000, comparePrice: null,   image: "/tshirt-model.png",  hover: "/tshirt-front.png",  badge: "NUEVO", sizes: ["S","M","L","XL"] },
  { id: "8",  name: "Noir T-Shirt — Ghost Print",    slug: "noir-tshirt-ghost",     price: 189000, comparePrice: null,   image: "/tshirt-back.png",   hover: "/tshirt-model.png",  badge: "NUEVO", sizes: ["S","M","L","XL"] },
  { id: "9",  name: "Noir T-Shirt — Urban Cut",      slug: "noir-tshirt-urban",     price: 185000, comparePrice: null,   image: "/tshirt-front.png",  hover: "/tshirt-back.png",   badge: "NUEVO", sizes: ["S","M","L","XL"] },
  { id: "10", name: "Noir T-Shirt — Oversized",      slug: "noir-tshirt-oversized", price: 199000, comparePrice: null,   image: "/tshirt-model.png",  hover: "/tshirt-front.png",  badge: "NUEVO", sizes: ["S","M","L","XL"] },
];

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCartStore();

  return (
    <div
      className="group w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/producto/${product.slug}`}>
        <div className="relative overflow-hidden bg-[#F2F2F2]" style={{ aspectRatio: "3/4" }}>
          <span className="absolute top-2 left-2 z-10 bg-white/80 text-[#888] text-[9px] font-semibold tracking-widest px-[7px] py-[3px] uppercase">
            {product.badge}
          </span>
          <Image
            src={hovered ? product.hover : product.image}
            alt={product.name}
            fill
            className="object-cover transition-all duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                addItem({ id: nanoid(), productId: product.id, name: product.name, price: product.price, image: product.image, quantity: 1, slug: product.slug });
                toast.success("Agregado al carrito");
              }}
              className="w-full bg-noir-black text-white text-[10px] font-bold tracking-[0.15em] uppercase py-[10px] hover:bg-black transition-colors"
            >
              AGREGAR
            </button>
          </div>
        </div>
      </Link>

      <div className="mt-[10px]">
        <Link href={`/producto/${product.slug}`}>
          <p className="text-[12px] text-[#333] leading-snug line-clamp-2 hover:opacity-70 transition-opacity font-normal">
            {product.name}
          </p>
        </Link>
        <p className="text-[12px] font-semibold text-noir-black mt-[5px]">
          {formatPrice(product.price)}
          {product.comparePrice && (
            <span className="ml-2 text-[11px] font-normal text-noir-gray-4 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </p>
        <div className="flex gap-1 flex-wrap mt-[7px]">
          {product.sizes.map((s) => (
            <span
              key={s}
              className="text-[9px] font-medium border border-noir-gray-2 text-noir-gray-4 px-[6px] py-[2px] leading-tight hover:border-noir-black hover:text-noir-black transition-colors cursor-pointer"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Carousel ─────────────────────────────────────────────────────────────────
function ProductRow({ products }: { products: typeof PRODUCTS }) {
  const [page, setPage] = useState(0);
  const max = Math.ceil(products.length / 5) - 1;
  const visible = products.slice(page * 5, page * 5 + 5);

  return (
    <div className="relative px-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-[18px]">
        {visible.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {max > 0 && (
        <>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="absolute left-0 top-[38%] -translate-y-1/2 w-7 h-7 bg-white border border-noir-gray-2 flex items-center justify-center disabled:opacity-20 hover:bg-noir-gray transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(max, p + 1))}
            disabled={page === max}
            className="absolute right-0 top-[38%] -translate-y-1/2 w-7 h-7 bg-white border border-noir-gray-2 flex items-center justify-center disabled:opacity-20 hover:bg-noir-gray transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePageClient({ pageData }: { pageData: HomePageData }) {
  const { heroBanner, collection1Banner, collection2Banner } = pageData;

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main>

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        {heroBanner.visible !== false && (
          <section className="relative w-full overflow-hidden" style={{ height: "86vh", minHeight: 520 }}>
            <Image
              src={heroBanner.image || "/hero-main.jpg"}
              alt="NOIR LOVERS — Nueva Colección"
              fill
              className="object-cover object-center"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/15 to-black/65" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
            <div className="absolute bottom-0 left-0 px-8 md:px-14 pb-14 md:pb-20">
              <p className={`text-[10px] font-semibold tracking-[0.35em] uppercase mb-3 ${heroBanner.textColor === "black" ? "text-black/65" : "text-white/65"}`}>
                NUEVA COLECCIÓN 2025
              </p>
              <h1
                className={`font-black uppercase leading-[0.88] tracking-tight ${heroBanner.textColor === "black" ? "text-black" : "text-white"}`}
                style={{ fontSize: "clamp(62px, 10.5vw, 130px)" }}
              >
                {heroBanner.headline ? heroBanner.headline.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < heroBanner.headline.split("\n").length - 1 && <br />}</span>
                )) : <><span>NOIR</span><br /><span>LOVERS</span></>}
              </h1>
              <p className={`text-[13px] mt-4 max-w-[260px] leading-relaxed ${heroBanner.textColor === "black" ? "text-black/60" : "text-white/60"}`}>
                {heroBanner.subtext || "Ropa negra para hombres que saben lo que quieren."}
              </p>
              <Link
                href={heroBanner.ctaLink || "/tienda"}
                className={`inline-block mt-7 text-[10px] font-bold tracking-[0.22em] uppercase px-7 py-[11px] transition-colors ${
                  heroBanner.textColor === "black"
                    ? "border border-black/75 text-black hover:bg-black hover:text-white"
                    : "border border-white/75 text-white hover:bg-white hover:text-noir-black"
                }`}
              >
                {heroBanner.cta || "VER LA COLECCIÓN"}
              </Link>
            </div>
          </section>
        )}

        {/* ══ DESTACADOS ════════════════════════════════════════════════════ */}
        <section className="bg-white pt-11 pb-12">
          <div className="max-w-screen-xl mx-auto px-6">
            <p className="text-center text-[10px] font-bold tracking-[0.35em] uppercase mb-8">
              DESTACADOS
            </p>
            <div className="space-y-6">
              <ProductRow products={PRODUCTS.slice(0, 5)} />
              <ProductRow products={PRODUCTS.slice(5, 10)} />
            </div>
            <div className="text-center mt-10">
              <Link
                href="/tienda"
                className="inline-block border border-noir-black text-[10px] font-bold tracking-[0.22em] uppercase px-10 py-[11px] hover:bg-noir-black hover:text-white transition-colors"
              >
                VER TODA LA COLECCIÓN
              </Link>
            </div>
          </div>
        </section>

        {/* ══ BANNER COLECCIÓN 1 ════════════════════════════════════════════ */}
        {collection1Banner.visible !== false && (
          <section className="relative w-full overflow-hidden" style={{ height: "68vh", minHeight: 440 }}>
            <Image
              src={collection1Banner.image || "/banner-collection-1.webp"}
              alt={collection1Banner.headline || "UNIQUE VIBE — Timeless Collection"}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 text-center">
              <p
                className={`font-black uppercase leading-none tracking-tight drop-shadow-lg ${collection1Banner.textColor === "black" ? "text-black" : "text-white"}`}
                style={{ fontSize: "clamp(34px, 6.5vw, 82px)" }}
              >
                {collection1Banner.headline || "UNIQUE VIBE"}
              </p>
              <p className={`text-[10px] font-bold tracking-[0.4em] uppercase mt-1 mb-5 drop-shadow ${collection1Banner.textColor === "black" ? "text-black/70" : "text-white/70"}`}>
                {collection1Banner.subtext || "COLLECTION"}
              </p>
              <Link
                href={collection1Banner.ctaLink || "/tienda"}
                className={`inline-block text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-[10px] transition-colors ${
                  collection1Banner.textColor === "black"
                    ? "border border-black text-black hover:bg-black hover:text-white"
                    : "border border-white text-white hover:bg-white hover:text-noir-black"
                }`}
              >
                {collection1Banner.cta || "CONTINUAR"}
              </Link>
            </div>
          </section>
        )}

        {/* ══ NUEVO ═════════════════════════════════════════════════════════ */}
        <section className="bg-white pt-11 pb-12">
          <div className="max-w-screen-xl mx-auto px-6">
            <p className="text-center text-[10px] font-bold tracking-[0.35em] uppercase mb-8">
              NUEVO
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-[18px] items-end px-5">
              {PRODUCTS.slice(0, 5).map((p, i) => (
                <div key={p.id} className={i === 2 ? "md:-mt-10" : ""}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/tienda"
                className="inline-block border border-noir-black text-[10px] font-bold tracking-[0.22em] uppercase px-10 py-[11px] hover:bg-noir-black hover:text-white transition-colors"
              >
                VER TODO
              </Link>
            </div>
          </div>
        </section>

        {/* ══ BANNER COLECCIÓN 2 ════════════════════════════════════════════ */}
        {collection2Banner.visible !== false && (
          <section className="relative w-full overflow-hidden" style={{ height: "62vh", minHeight: 400 }}>
            <Image
              src={collection2Banner.image || "/banner-collection-2.webp"}
              alt={collection2Banner.headline || "UNIQUE VIBE — Records Collection"}
              fill
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 text-center">
              <p
                className={`font-black uppercase leading-none tracking-tight drop-shadow-lg ${collection2Banner.textColor === "black" ? "text-black" : "text-white"}`}
                style={{ fontSize: "clamp(30px, 5.5vw, 72px)" }}
              >
                {collection2Banner.headline || "UNIQUE VIBE"}
              </p>
              <p className={`text-[10px] font-bold tracking-[0.4em] uppercase mt-1 mb-5 drop-shadow ${collection2Banner.textColor === "black" ? "text-black/70" : "text-white/70"}`}>
                {collection2Banner.subtext || "COLLECTION"}
              </p>
              <Link
                href={collection2Banner.ctaLink || "/tienda"}
                className={`inline-block text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-[10px] transition-colors ${
                  collection2Banner.textColor === "black"
                    ? "border border-black text-black hover:bg-black hover:text-white"
                    : "border border-white text-white hover:bg-white hover:text-noir-black"
                }`}
              >
                {collection2Banner.cta || "CONTINUAR"}
              </Link>
            </div>
          </section>
        )}

        {/* ══ CATEGORÍAS ════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-2 md:grid-cols-4">
          {[
            { label: "CAMISETAS", slug: "camisetas", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80" },
            { label: "PANTALONES", slug: "pantalones", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&q=80" },
            { label: "HOODIES",    slug: "hoodies",    img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80" },
            { label: "CHAQUETAS",  slug: "chaquetas",  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80" },
          ].map((cat) => (
            <Link
              key={cat.slug}
              href={`/categoria/${cat.slug}`}
              className="group relative overflow-hidden"
              style={{ aspectRatio: "3/4" }}
            >
              <Image
                src={cat.img}
                alt={cat.label}
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-noir-black/25 group-hover:bg-noir-black/45 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                <span className="text-white text-[11px] font-black tracking-[0.18em] uppercase">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* ══ TRUST BADGES ══════════════════════════════════════════════════ */}
        <section className="bg-white border-t border-noir-gray-2 py-9">
          <div className="max-w-screen-xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
            {[
              { icon: <Truck size={19} strokeWidth={1.5} />, label: "ENVÍO GRATIS", sub: "Desde $250.000" },
              { icon: <Clock size={19} strokeWidth={1.5} />, label: "2-5 DÍAS HÁBILES", sub: "Entrega estimada" },
              { icon: <RefreshCw size={19} strokeWidth={1.5} />, label: "DEVOLUCIONES SENCILLAS", sub: "30 días sin preguntas" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-[7px] text-center">
                <div className="text-noir-black">{b.icon}</div>
                <p className="text-[10px] font-black tracking-[0.18em] uppercase">{b.label}</p>
                <p className="text-[10px] text-noir-gray-4">{b.sub}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
