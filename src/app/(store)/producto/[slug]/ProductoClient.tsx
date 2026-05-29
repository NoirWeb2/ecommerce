"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, ChevronLeft, ChevronRight, RotateCcw, Truck, Shield, Scissors, Check as CheckIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import ProductCard from "@/components/store/ProductCard";

const paymentLogos = ["Wompi", "Mercado Pago", "PSE", "Nequi", "Mastercard", "VISA"];

interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  description: string | null;
  images: string[];
  sizes: string[];
  category: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  sizes: string[];
}

function AddTheLookButton() {
  const { addItem, items } = useCartStore();
  const BARBER_ID = "barber-addon-001";
  const isAdded = items.some((i) => i.productId === BARBER_ID);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    if (isAdded) return;
    addItem({
      id: `${BARBER_ID}-${Date.now()}`,
      productId: BARBER_ID,
      name: "Corte de pelo + Gel eGo",
      price: 20000,
      image: "/logo.svg",
      slug: "corte-barber-brothers",
      quantity: 1,
    });
    setJustAdded(true);
    toast.success("Corte de pelo + Gel eGo añadido al carrito");
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="border border-noir-gray-2 overflow-hidden">
      <button onClick={handleAdd} disabled={isAdded}
        className={`w-full transition-all duration-300 ${isAdded ? "bg-noir-gray cursor-default" : "bg-noir-black hover:bg-black"}`}>
        <div className="flex items-center justify-center py-3.5 px-4 gap-2">
          {isAdded ? <CheckIcon size={15} className="text-green-600" /> : <Scissors size={15} className="text-white" />}
          <div className="text-left">
            <p className={`text-xs font-black tracking-[0.1em] uppercase ${isAdded ? "text-noir-gray-4" : "text-white"}`}>
              {isAdded ? "CORTE AÑADIDO AL CARRITO" : "ADD THE LOOK — CORTE DE PELO +$20.000"}
            </p>
            <p className={`text-[9px] tracking-wide font-medium ${isAdded ? "text-noir-gray-4" : "text-white/60"}`}>
              {isAdded ? "Gel eGo incluido · Barber Brothers" : "Incluye Gel eGo · Solo Bogotá · Mínimo 3 prendas"}
            </p>
          </div>
        </div>
      </button>
      <div className="bg-noir-gray px-4 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black tracking-widest uppercase text-noir-gray-4">BARBERÍA eGo ALIADA</p>
          <p className="text-[10px] font-bold text-noir-black mt-0.5">Barber Brothers</p>
        </div>
        <a href="https://www.instagram.com/barberbrothers.co/" target="_blank" rel="noopener noreferrer"
          className="text-[9px] font-bold tracking-widest uppercase text-noir-gray-4 hover:text-noir-black transition-colors border border-noir-gray-2 hover:border-noir-black px-2.5 py-1.5">
          @barberbrothers.co ↗
        </a>
      </div>
    </div>
  );
}

export default function ProductoClient({ product, related }: { product: ProductData; related: RelatedProduct[] }) {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Por favor selecciona una talla"); return; }
    addItem({
      id: nanoid(),
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/placeholder-product.jpg",
      size: selectedSize,
      quantity: 1,
      slug: product.slug,
    });
    toast.success("Agregado al carrito");
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-noir-gray">
            <Image src={product.images[currentImage] || "/placeholder-product.jpg"}
              alt={product.name} fill className="object-cover" priority />
            {product.images.length > 1 && <>
              <button onClick={() => setCurrentImage((p) => (p - 1 + product.images.length) % product.images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentImage((p) => (p + 1) % product.images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition">
                <ChevronRight size={16} />
              </button>
            </>}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setCurrentImage(i)}
                  className={`relative aspect-square overflow-hidden bg-noir-gray border-2 transition-colors ${i === currentImage ? "border-noir-black" : "border-transparent"}`}>
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-2">{product.category}</p>
          <h1 className="text-xl font-black uppercase leading-tight tracking-tight">{product.name}</h1>
          <div className="flex items-baseline gap-3 mt-3">
            <p className="text-2xl font-bold">{formatPrice(product.price)}</p>
            {product.comparePrice && (
              <p className="text-sm text-noir-gray-4 line-through">{formatPrice(product.comparePrice)}</p>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest uppercase">TALLA</p>
              <Link href="/tallas" className="text-xs text-noir-gray-4 underline underline-offset-2 flex items-center gap-1">
                <Shield size={12} /> Guía de tallas
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((s) => (
                <button key={s} onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                  className={`min-w-[52px] h-11 px-3 text-xs font-bold tracking-widest uppercase border-2 transition-colors ${
                    selectedSize === s ? "border-noir-black bg-noir-black text-white" : "border-noir-gray-2 hover:border-noir-black"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8"><AddTheLookButton /></div>

          <div className="mt-3 space-y-3">
            <button onClick={handleAddToCart}
              className="w-full bg-noir-black text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> AGREGAR AL CARRITO
            </button>
            <button className="w-full border-2 border-noir-black py-4 text-xs font-bold tracking-widest uppercase hover:bg-noir-black hover:text-white transition-colors">
              COMPRAR AHORA
            </button>
          </div>

          <div className="mt-6 p-4 bg-noir-gray">
            <div className="flex items-center gap-2 text-noir-gray-4">
              <Truck size={14} />
              <span className="text-xs">Entrega estimada: 2-5 días hábiles</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {paymentLogos.map((logo) => (
              <span key={logo} className="text-[9px] font-bold bg-noir-gray px-2 py-1 text-noir-gray-4 uppercase tracking-wide border border-noir-gray-2">
                {logo}
              </span>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t border-noir-gray-2 pt-6">
            {[
              { icon: <Truck size={16} />, label: "Envíos", sub: "Colombia" },
              { icon: <Shield size={16} />, label: "Pago seguro", sub: "siempre" },
              { icon: <RotateCcw size={16} />, label: "Cambios", sub: "fáciles" },
            ].map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-1">
                <div className="text-noir-gray-4">{f.icon}</div>
                <p className="text-xs font-medium">{f.label}</p>
                <p className="text-xs text-noir-gray-4">{f.sub}</p>
              </div>
            ))}
          </div>

          {product.description && (
            <div className="mt-8 border-t border-noir-gray-2 pt-6">
              <p className="text-xs font-bold tracking-widest uppercase mb-3">DESCRIPCIÓN</p>
              <p className="text-sm text-noir-gray-4 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-center mb-10 text-noir-gray-4">
            TE PODRÍA INTERESAR
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => <ProductCard key={p.id} {...p} />)}
          </div>
        </div>
      )}
    </div>
  );
}