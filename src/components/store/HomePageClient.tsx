"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Truck, Clock, RefreshCw } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import type { HomePageData } from "@/lib/page-settings";

// 💡 FIX: Le ponemos 'any' para que acepte los objetos de imagen y categoria completos
function ProductCard({ product }: { product: any }) {
const [hovered, setHovered] = useState(false);
const { addItem } = useCartStore();

// 💡 FIX: Ahora extraemos correctamente el ".url" de los objetos de imagen
const mainImage = product.images?.[0]?.url || "/placeholder-product.jpg";
const hoverImage = product.images?.[1]?.url || mainImage;

return (
  <div className="group w-full" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
    <Link href={`/producto/${product.slug}`}>
      <div className="relative overflow-hidden bg-[#F2F2F2]" style={{ aspectRatio: "3/4" }}>
        <img
          src={hovered ? hoverImage : mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({
                id: nanoid(), productId: product.id, name: product.name, price: product.price,
                image: mainImage, quantity: 1, slug: product.slug,
              });
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
    </div>
  </div>
);
}

function ProductRow({ products, emptyMessage }: { products: any[], emptyMessage: string }) {
const [page, setPage] = useState(0);
const max = Math.ceil(products.length / 5) - 1;
const visible = products.slice(page * 5, page * 5 + 5);

if (products.length === 0) {
  return <p className="text-center text-xs text-noir-gray-4 py-8">{emptyMessage}</p>;
}

return (
  <div className="relative px-5">
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-[18px]">
      {visible.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
    {max > 0 && (
      <>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="absolute left-0 top-[38%] -translate-y-1/2 w-7 h-7 bg-white border border-noir-gray-2 flex items-center justify-center disabled:opacity-20 hover:bg-noir-gray transition-colors">
          <ChevronLeft size={13} />
        </button>
        <button onClick={() => setPage((p) => Math.min(max, p + 1))} disabled={page === max} className="absolute right-0 top-[38%] -translate-y-1/2 w-7 h-7 bg-white border border-noir-gray-2 flex items-center justify-center disabled:opacity-20 hover:bg-noir-gray transition-colors">
          <ChevronRight size={13} />
        </button>
      </>
    )}
  </div>
);
}

export default function HomePageClient({ pageData }: { pageData: HomePageData }) {
const { heroBanner, collection1Banner, collection2Banner } = pageData;

const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
const [latestProducts, setLatestProducts] = useState<any[]>([]);
const [categories, setCategories] = useState<any[]>([]);

useEffect(() => {
  async function loadData() {
    try {
      const cacheBuster = Date.now();
      const [resProd, resCat] = await Promise.all([
        fetch(`/api/products?t=${cacheBuster}`, { cache: "no-store" }),
        fetch(`/api/categories?t=${cacheBuster}`, { cache: "no-store" })
      ]);

      if (resProd.ok) {
        const dataProd = await resProd.json();
        const allProducts = dataProd.products || [];
        // 1. Separar Destacados
        setFeaturedProducts(allProducts.filter((p: any) => p.isFeatured === true));
        // 2. Separar los 5 más nuevos
        setLatestProducts(allProducts.slice(0, 5));
      }

      if (resCat.ok) {
        const dataCat = await resCat.json();
        setCategories((dataCat.categories || []).slice(0, 4));
      }

    } catch (error) {
      console.error("Error cargando el Home:", error);
    }
  }
  loadData();
}, []);

return (
  <main>
    {/* ── 1. HERO BANNER ── */}
    {heroBanner.visible !== false && (
      <section className="relative w-full overflow-hidden" style={{ height: "86vh", minHeight: 520 }}>
        <img src={heroBanner.image || "/hero-main.jpg"} alt="NOIR LOVERS" className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/15 to-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
        <div className="absolute bottom-0 left-0 px-8 md:px-14 pb-14 md:pb-20">
          <p className={`text-[10px] font-semibold tracking-[0.35em] uppercase mb-3 ${heroBanner.textColor === "black" ? "text-black/65" : "text-white/65"}`}>
            NUEVA COLECCIÓN
          </p>
          <h1 className={`font-black uppercase leading-[0.88] tracking-tight ${heroBanner.textColor === "black" ? "text-black" : "text-white"}`} style={{ fontSize: "clamp(62px, 10.5vw, 130px)" }}>
            {heroBanner.headline}
          </h1>
          <p className={`text-[13px] mt-4 max-w-[260px] leading-relaxed ${heroBanner.textColor === "black" ? "text-black/60" : "text-white/60"}`}>
            {heroBanner.subtext}
          </p>
          <Link href={heroBanner.ctaLink || "/tienda"} className={`inline-block mt-7 text-[10px] font-bold tracking-[0.22em] uppercase px-7 py-[11px] transition-colors ${heroBanner.textColor === "black" ? "border border-black/75 text-black hover:bg-black hover:text-white" : "border border-white/75 text-white hover:bg-white hover:text-noir-black"}`}>
            {heroBanner.cta || "VER LA COLECCIÓN"}
          </Link>
        </div>
      </section>
    )}

    {/* ── 2. DESTACADOS ── */}
    <section className="bg-white pt-11 pb-12">
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.35em] uppercase mb-8">
          DESTACADOS
        </p>
        <div className="space-y-6">
          <ProductRow products={featuredProducts} emptyMessage="No hay productos destacados aún." />
        </div>
      </div>
    </section>

    {/* ── 3. COLLECTION BANNER 1 ── */}
    {collection1Banner.visible !== false && (
      <section className="relative w-full overflow-hidden" style={{ height: "68vh", minHeight: 440 }}>
        <img src={collection1Banner.image || "/banner-collection-1.webp"} alt={collection1Banner.headline || "UNIQUE VIBE"} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 text-center">
          <p className={`font-black uppercase leading-none tracking-tight drop-shadow-lg ${collection1Banner.textColor === "black" ? "text-black" : "text-white"}`} style={{ fontSize: "clamp(34px, 6.5vw, 82px)" }}>
            {collection1Banner.headline}
          </p>
          <p className={`text-[10px] font-bold tracking-[0.4em] uppercase mt-1 mb-5 drop-shadow ${collection1Banner.textColor === "black" ? "text-black/70" : "text-white/70"}`}>
            {collection1Banner.subtext}
          </p>
          <Link href={collection1Banner.ctaLink || "/tienda"} className={`inline-block text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-[10px] transition-colors ${collection1Banner.textColor === "black" ? "border border-black text-black hover:bg-black hover:text-white" : "border border-white text-white hover:bg-white hover:text-noir-black"}`}>
            {collection1Banner.cta || "CONTINUAR"}
          </Link>
        </div>
      </section>
    )}

    {/* ── 4. NUEVOS (Últimos 5) ── */}
    <section className="bg-white pt-11 pb-12">
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.35em] uppercase mb-8">
          NUEVO
        </p>
        <div className="space-y-6">
          <ProductRow products={latestProducts} emptyMessage="No hay productos nuevos aún." />
        </div>
        <div className="text-center mt-10">
          <Link href="/tienda" className="inline-block border border-noir-black text-[10px] font-bold tracking-[0.22em] uppercase px-10 py-[11px] hover:bg-noir-black hover:text-white transition-colors">
            VER TODA LA COLECCIÓN
          </Link>
        </div>
      </div>
    </section>

    {/* ── 5. COLLECTION BANNER 2 ── */}
    {collection2Banner && collection2Banner.visible !== false && (
      <section className="relative w-full overflow-hidden" style={{ height: "68vh", minHeight: 440 }}>
        <img src={collection2Banner.image || "/banner-collection-2.webp"} alt={collection2Banner.headline || "UNIQUE VIBE II"} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 text-center">
          <p className={`font-black uppercase leading-none tracking-tight drop-shadow-lg ${collection2Banner.textColor === "black" ? "text-black" : "text-white"}`} style={{ fontSize: "clamp(34px, 6.5vw, 82px)" }}>
            {collection2Banner.headline}
          </p>
          <p className={`text-[10px] font-bold tracking-[0.4em] uppercase mt-1 mb-5 drop-shadow ${collection2Banner.textColor === "black" ? "text-black/70" : "text-white/70"}`}>
            {collection2Banner.subtext}
          </p>
          <Link href={collection2Banner.ctaLink || "/tienda"} className={`inline-block text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-[10px] transition-colors ${collection2Banner.textColor === "black" ? "border border-black text-black hover:bg-black hover:text-white" : "border border-white text-white hover:bg-white hover:text-noir-black"}`}>
            {collection2Banner.cta || "VER MÁS"}
          </Link>
        </div>
      </section>
    )}

    {/* ── 6. CATEGORÍAS (DINÁMICAS) ── */}
    {categories.length > 0 && (
      <section className="bg-white py-12">
        <p className="text-center text-[10px] font-bold tracking-[0.35em] uppercase mb-8">
          TIENDA POR CATEGORÍA
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 w-full h-[60vh] md:h-[75vh]">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categoria/${cat.slug}`} className="relative group overflow-hidden block h-full">
              <img 
                src={cat.image || "/placeholder-product.jpg"} 
                alt={cat.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <p className="text-white text-xs font-black tracking-widest uppercase">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    )}

    {/* ── 7. BENEFITS ── */}
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
);
}