"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";

interface DBLook {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string;
  isActive: boolean;
  order: number;
}

function LookCard({ look, index }: { look: DBLook; index: number }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isReversed = index % 2 !== 0;

  const handleAddAll = () => {
    addItem({
      id: `${look.id}-look`,
      productId: look.id,
      name: look.title,
      price: 0,
      image: look.image,
      size: "LOOK",
      slug: look.slug,
      quantity: 1,
    });
    setAdded(true);
    toast.success(`Look "${look.title}" añadido al carrito`);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 border-b border-noir-gray-2 ${isReversed ? "md:[direction:rtl]" : ""}`}>
      <div className={`relative overflow-hidden bg-noir-gray ${isReversed ? "[direction:ltr]" : ""}`} style={{ minHeight: 520 }}>
        <Image
          src={look.image}
          alt={look.title}
          fill
          className="object-cover object-top"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-5 left-5">
          <span className="bg-noir-black text-white text-[9px] font-black tracking-[0.2em] px-3 py-1.5 uppercase">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
      </div>

      <div className={`flex flex-col justify-center p-8 md:p-12 bg-white ${isReversed ? "[direction:ltr]" : ""}`}>
        <p className="text-[9px] font-black tracking-[0.3em] uppercase text-noir-gray-4 mb-3">TOTAL LOOK</p>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight mb-3">{look.title}</h2>
        {look.description && (
          <p className="text-xs text-noir-gray-4 leading-relaxed mb-7 max-w-sm">{look.description}</p>
        )}
        <div className="border-t border-noir-gray-2 mb-6" />
        <button
          onClick={handleAddAll}
          className="flex items-center justify-center gap-2 bg-noir-black text-white py-4 text-[11px] font-black tracking-[0.15em] uppercase hover:bg-black transition-colors w-full"
        >
          {added ? (
            <><Check size={14} /> AÑADIDO AL CARRITO</>
          ) : (
            <><ShoppingBag size={14} /> AÑADIR LOOK COMPLETO</>
          )}
        </button>
      </div>
    </div>
  );
}

export default function TotalLooksClient({ looks }: { looks: DBLook[] }) {
  if (looks.length === 0) {
    return (
      <div className="py-20 text-center text-noir-gray-4">
        <p className="text-sm">No hay looks disponibles aún.</p>
      </div>
    );
  }

  return (
    <>
      {looks.map((look, i) => (
        <LookCard key={look.id} look={look} index={i} />
      ))}
    </>
  );
}