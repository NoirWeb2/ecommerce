"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
ChevronLeft,
ChevronRight,
Truck,
Clock,
RefreshCw,
} from "lucide-react";

import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartSidebar from "@/components/store/CartSidebar";

import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { nanoid } from "nanoid";

import type { HomePageData } from "@/lib/page-settings";

interface Product {
id: string;
name: string;
slug: string;
price: number;
comparePrice?: number | null;
images?: string[];
}

function ProductCard({ product }: { product: Product }) {
const [hovered, setHovered] = useState(false);
const { addItem } = useCartStore();

return (
<div
className="group w-full"
onMouseEnter={() => setHovered(true)}
onMouseLeave={() => setHovered(false)}
>
<Link href={`/producto/${product.slug}`}>
<div
className="relative overflow-hidden bg-[#F2F2F2]"
style={{ aspectRatio: "3/4" }}
>
<Image
src={
hovered
? product.images?.[1] ||
product.images?.[0] ||
"/placeholder-product.jpg"
: product.images?.[0] || "/placeholder-product.jpg"
}
alt={product.name}
fill
className="object-cover transition-all duration-500"
sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
/>

```
      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 p-2">
        <button
          onClick={(e) => {
            e.preventDefault();

            addItem({
              id: nanoid(),
              productId: product.id,
              name: product.name,
              price: product.price,
              image:
                product.images?.[0] || "/placeholder-product.jpg",
              quantity: 1,
              slug: product.slug,
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

function ProductRow({ products }: { products: Product[] }) {
const [page, setPage] = useState(0);

const max = Math.ceil(products.length / 5) - 1;

const visible = products.slice(page * 5, page * 5 + 5);

return ( <div className="relative px-5"> <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-[18px]">
{visible.map((p) => ( <ProductCard key={p.id} product={p} />
))} </div>

```
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
```

);
}

export default function HomePageClient({
pageData,
}: {
pageData: HomePageData;
}) {
const {
heroBanner,
collection1Banner,
collection2Banner,
} = pageData;

const [products, setProducts] = useState<Product[]>([]);

useEffect(() => {
async function loadProducts() {
try {
const res = await fetch("/api/products");

```
    if (!res.ok) return;

    const data = await res.json();

    setProducts(data.products || []);
  } catch (error) {
    console.error(error);
  }
}

loadProducts();
```

}, []);

return (
<> <Navbar /> <CartSidebar />

```
  <main>
    {heroBanner.visible !== false && (
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "86vh", minHeight: 520 }}
      >
        <Image
          src={heroBanner.image || "/hero-main.jpg"}
          alt="NOIR LOVERS"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/15 to-black/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />

        <div className="absolute bottom-0 left-0 px-8 md:px-14 pb-14 md:pb-20">
          <p
            className={`text-[10px] font-semibold tracking-[0.35em] uppercase mb-3 ${
              heroBanner.textColor === "black"
                ? "text-black/65"
                : "text-white/65"
            }`}
          >
            NUEVA COLECCIÓN 2025
          </p>

          <h1
            className={`font-black uppercase leading-[0.88] tracking-tight ${
              heroBanner.textColor === "black"
                ? "text-black"
                : "text-white"
            }`}
            style={{
              fontSize: "clamp(62px, 10.5vw, 130px)",
            }}
          >
            {heroBanner.headline}
          </h1>

          <p
            className={`text-[13px] mt-4 max-w-[260px] leading-relaxed ${
              heroBanner.textColor === "black"
                ? "text-black/60"
                : "text-white/60"
            }`}
          >
            {heroBanner.subtext}
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

    <section className="bg-white pt-11 pb-12">
      <div className="max-w-screen-xl mx-auto px-6">
        <p className="text-center text-[10px] font-bold tracking-[0.35em] uppercase mb-8">
          DESTACADOS
        </p>

        <div className="space-y-6">
          <ProductRow products={products.slice(0, 5)} />
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

    {collection1Banner.visible !== false && (
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "68vh", minHeight: 440 }}
      >
        <Image
          src={
            collection1Banner.image ||
            "/banner-collection-1.webp"
          }
          alt={collection1Banner.headline || "UNIQUE VIBE"}
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 text-center">
          <p
            className={`font-black uppercase leading-none tracking-tight drop-shadow-lg ${
              collection1Banner.textColor === "black"
                ? "text-black"
                : "text-white"
            }`}
            style={{
              fontSize: "clamp(34px, 6.5vw, 82px)",
            }}
          >
            {collection1Banner.headline}
          </p>

          <p
            className={`text-[10px] font-bold tracking-[0.4em] uppercase mt-1 mb-5 drop-shadow ${
              collection1Banner.textColor === "black"
                ? "text-black/70"
                : "text-white/70"
            }`}
          >
            {collection1Banner.subtext}
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

    <section className="bg-white border-t border-noir-gray-2 py-9">
      <div className="max-w-screen-xl mx-auto px-8 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-20">
        {[
          {
            icon: <Truck size={19} strokeWidth={1.5} />,
            label: "ENVÍO GRATIS",
            sub: "Desde $250.000",
          },
          {
            icon: <Clock size={19} strokeWidth={1.5} />,
            label: "2-5 DÍAS HÁBILES",
            sub: "Entrega estimada",
          },
          {
            icon: <RefreshCw size={19} strokeWidth={1.5} />,
            label: "DEVOLUCIONES SENCILLAS",
            sub: "30 días sin preguntas",
          },
        ].map((b) => (
          <div
            key={b.label}
            className="flex flex-col items-center gap-[7px] text-center"
          >
            <div className="text-noir-black">
              {b.icon}
            </div>

            <p className="text-[10px] font-black tracking-[0.18em] uppercase">
              {b.label}
            </p>

            <p className="text-[10px] text-noir-gray-4">
              {b.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  </main>

  <Footer />
</>
```

);
}
