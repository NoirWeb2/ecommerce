"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

interface LookProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  slug: string;
}

interface Look {
  id: string;
  label: string;
  title: string;
  description: string;
  image: string;
  products: LookProduct[];
}

const LOOKS: Look[] = [
  {
    id: "1",
    label: "TOTAL LOOK",
    title: "URBAN NOIR EXECUTIVE",
    description:
      "El outfit del hombre que domina la semana. Negro de la cabeza a los pies, corte preciso, actitud implacable.",
    image: "/tshirt-model.png",
    products: [
      { id: "p1", name: "Noir Oversized Tee — Black", category: "Camisetas", price: 189000, image: "/tshirt-front.png", slug: "noir-oversized-tee-black" },
      { id: "p2", name: "Shadow Cargo Pants", category: "Pantalones", price: 295000, image: "/tshirt-back.png", slug: "shadow-cargo-pants" },
      { id: "p3", name: "Eclipse Hoodie", category: "Hoodies", price: 249000, image: "/tshirt-detail.png", slug: "eclipse-hoodie" },
    ],
  },
  {
    id: "2",
    label: "TOTAL LOOK",
    title: "CATHEDRAL DARK",
    description:
      "Capas, texturas y siluetas amplias. Una composición pensada para quienes no pasan desapercibidos.",
    image: "/hero-main.jpg",
    products: [
      { id: "p4", name: "Phantom Coach Jacket", category: "Chaquetas", price: 399000, image: "/tshirt-front.png", slug: "phantom-coach-jacket" },
      { id: "p5", name: "Eclipse Slim Pants", category: "Pantalones", price: 279000, image: "/tshirt-back.png", slug: "eclipse-slim-pants" },
      { id: "p6", name: "Noir Classic Tee", category: "Camisetas", price: 169000, image: "/tshirt-detail.png", slug: "noir-classic-tee" },
    ],
  },
];

function LookCard({ look, index }: { look: Look; index: number }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const total = look.products.reduce((acc, p) => acc + p.price, 0);

  const handleAddAll = () => {
    look.products.forEach((p) => {
      addItem({
        id: `${p.id}-M`,
        productId: p.id,
        name: p.name,
        price: p.price,
        image: p.image,
        size: "M",
        slug: p.slug,
        quantity: 1,
      });
    });
    setAdded(true);
    toast.success(`Look "${look.title}" añadido al carrito`);
    setTimeout(() => setAdded(false), 2500);
  };

  const isReversed = index % 2 !== 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-noir-gray-2 ${isReversed ? "md:[direction:rtl]" : ""}`}>
      {/* Photo */}
      <div className={`relative overflow-hidden bg-noir-gray ${isReversed ? "[direction:ltr]" : ""}`} style={{ minHeight: 520 }}>
        <Image
          src={look.image}
          alt={look.title}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
        {/* Look number badge */}
        <div className="absolute top-5 left-5">
          <span className="bg-noir-black text-white text-[9px] font-black tracking-[0.2em] px-3 py-1.5 uppercase">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className={`flex flex-col justify-center p-8 md:p-12 bg-white ${isReversed ? "[direction:ltr]" : ""}`}>
        {/* Label */}
        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-noir-gray-4 mb-3">
          {look.label}
        </p>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-3">
          {look.title}
        </h2>

        {/* Description */}
        <p className="text-xs text-noir-gray-4 leading-relaxed mb-7 max-w-sm">
          {look.description}
        </p>

        {/* Divider */}
        <div className="border-t border-noir-gray-2 mb-6" />

        {/* Products list */}
        <div className="space-y-4 mb-6">
          {look.products.map((product) => (
            <Link
              key={product.id}
              href={`/producto/${product.slug}`}
              className="flex items-center gap-4 group"
            >
              <div className="relative w-12 h-14 bg-noir-gray flex-shrink-0 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  sizes="48px"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase leading-tight group-hover:underline truncate">
                  {product.name}
                </p>
                <p className="text-[10px] text-noir-gray-4 mt-0.5 uppercase tracking-wide">
                  {product.category}
                </p>
              </div>
              <span className="text-sm font-black flex-shrink-0">
                {formatPrice(product.price)}
              </span>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-noir-gray-2 mb-5" />

        {/* Total */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4">
            TOTAL DEL LOOK
          </span>
          <span className="text-lg font-black">{formatPrice(total)}</span>
        </div>

        {/* CTA */}
        <button
          onClick={handleAddAll}
          className="flex items-center justify-center gap-2 bg-noir-black text-white py-4 text-[11px] font-black tracking-[0.15em] uppercase hover:bg-black transition-colors w-full"
        >
          {added ? (
            <>
              <Check size={14} /> AÑADIDO AL CARRITO
            </>
          ) : (
            <>
              <ShoppingBag size={14} /> AÑADIR LOOK COMPLETO
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function TotalLooksPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="max-w-screen-xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="text-[9px] font-black tracking-[0.35em] uppercase text-noir-gray-4 mb-3">
          CURADOS POR NOSOTROS
        </p>
        <h1 className="text-5xl md:text-[80px] font-black uppercase tracking-tight leading-none mb-4">
          TOTAL LOOKS
        </h1>
        <p className="text-xs text-noir-gray-4 max-w-md mx-auto">
          Outfits completos pensados por NOIR LOVERS. Cada look lleva la combinación exacta de prendas.
        </p>
      </div>

      {/* Promo Bar */}
      <div className="bg-noir-black text-white py-3 px-4 text-center">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase">
          TOTAL LOOK = CORTE DE CABELLO GRATIS
          <span className="mx-3 opacity-40">·</span>
          Mínimo 3 prendas
          <span className="mx-3 opacity-40">·</span>
          Válido en Barber Brothers
          <span className="mx-3 opacity-40">·</span>
          Solo Bogotá
        </p>
      </div>

      {/* Looks */}
      <div className="border-t border-noir-gray-2">
        {LOOKS.map((look, i) => (
          <LookCard key={look.id} look={look} index={i} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-noir-gray py-16 text-center px-6 border-t border-noir-gray-2">
        <p className="text-[9px] font-black tracking-[0.35em] uppercase text-noir-gray-4 mb-3">
          ARMA EL TUYO
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-5">
          EXPLORA LA COLECCIÓN
        </h2>
        <Link
          href="/tienda"
          className="inline-block bg-noir-black text-white text-[10px] font-black tracking-widest uppercase px-10 py-4 hover:bg-black transition-colors"
        >
          VER TODOS LOS PRODUCTOS
        </Link>
      </div>
    </div>
  );
}
