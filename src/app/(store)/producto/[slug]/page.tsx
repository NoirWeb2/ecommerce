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

const mockProduct = {
  id: "1",
  name: "NOIR OVERSIZED TEE — BLACK EDITION",
  slug: "noir-oversized-tee-black",
  price: 189000,
  comparePrice: null,
  description:
    "Camiseta oversized en algodón 100% peinado de 240gsm. Corte caja, hombros caídos, cuello redondo reforzado. Sin estampados innecesarios — solo la calidad y el corte hablan.",
  images: [
    "/tshirt-front.png",
    "/tshirt-back.png",
    "/tshirt-model.png",
    "/tshirt-corte.png",
  ],
  sizes: ["S", "M", "L", "XL"],
  category: "Camisetas",
};

const related = [
  { id: "2", name: "Noir Oversized Tee", slug: "noir-oversized-tee", price: 189000, images: ["/tshirt-front.png"], sizes: ["S", "M", "L", "XL"] },
  { id: "3", name: "Shadow Cargo Pants", slug: "shadow-cargo-pants", price: 295000, images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800&q=80"], sizes: ["S", "M", "L", "XL"] },
  { id: "4", name: "Eclipse Hoodie", slug: "eclipse-hoodie", price: 249000, images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80"], sizes: ["S", "M", "L", "XL"] },
  { id: "5", name: "Phantom Coach Jacket", slug: "phantom-coach", price: 399000, images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"], sizes: ["S", "M", "L", "XL"] },
];

const paymentLogos = ["Wompi", "Mercado Pago", "PSE", "Nequi", "Mastercard", "VISA"];

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
      {/* Main CTA button */}
      <button
        onClick={handleAdd}
        disabled={isAdded}
        className={`w-full transition-all duration-300 ${
          isAdded
            ? "bg-noir-gray cursor-default"
            : "bg-noir-black hover:bg-black"
        }`}
      >
        <div className="flex items-center justify-center py-3.5 px-4 gap-2">
          {isAdded ? (
            <CheckIcon size={15} className="text-green-600" />
          ) : (
            <Scissors size={15} className="text-white" />
          )}
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

      {/* Barber info strip */}
      <div className="bg-noir-gray px-4 py-2.5 flex items-center justify-between">
        <div>
          <p className="text-[9px] font-black tracking-widest uppercase text-noir-gray-4">BARBERÍA eGo ALIADA</p>
          <p className="text-[10px] font-bold text-noir-black mt-0.5">Barber Brothers</p>
        </div>
        <a
          href="https://www.instagram.com/barberbrothers.co/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] font-bold tracking-widest uppercase text-noir-gray-4 hover:text-noir-black transition-colors border border-noir-gray-2 hover:border-noir-black px-2.5 py-1.5"
        >
          @barberbrothers.co ↗
        </a>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Por favor selecciona una talla"); return; }
    addItem({
      id: nanoid(),
      productId: mockProduct.id,
      name: mockProduct.name,
      price: mockProduct.price,
      image: mockProduct.images[0],
      size: selectedSize,
      quantity: 1,
      slug: mockProduct.slug,
    });
    toast.success("Agregado al carrito");
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] overflow-hidden bg-noir-gray">
            <Image
              src={mockProduct.images[currentImage]}
              alt={mockProduct.name}
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <button
              onClick={() => setCurrentImage((p) => (p - 1 + mockProduct.images.length) % mockProduct.images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentImage((p) => (p + 1) % mockProduct.images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {mockProduct.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className={`relative aspect-square overflow-hidden bg-noir-gray border-2 transition-colors ${i === currentImage ? "border-noir-black" : "border-transparent"}`}
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-2">{mockProduct.category}</p>
          <h1 className="text-xl font-black uppercase leading-tight tracking-tight">{mockProduct.name}</h1>
          <div className="flex items-baseline gap-3 mt-3">
            <p className="text-2xl font-bold">{formatPrice(mockProduct.price)}</p>
            {mockProduct.comparePrice && (
              <p className="text-sm text-noir-gray-4 line-through">{formatPrice(mockProduct.comparePrice)}</p>
            )}
          </div>

          {/* Sizes */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest uppercase">TALLA</p>
              <Link href="/tallas" className="text-xs text-noir-gray-4 underline underline-offset-2 flex items-center gap-1">
                <Shield size={12} /> Guía de tallas
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap">
              {mockProduct.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                  className={`min-w-[52px] h-11 px-3 text-xs font-bold tracking-widest uppercase border-2 transition-colors ${
                    selectedSize === s
                      ? "border-noir-black bg-noir-black text-white"
                      : "border-noir-gray-2 hover:border-noir-black"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* ADD THE LOOK — Barber add-on */}
          <div className="mt-8">
            <AddTheLookButton />
          </div>

          {/* CTAs */}
          <div className="mt-3 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full bg-noir-black text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={16} />
              AGREGAR AL CARRITO
            </button>
            <button className="w-full border-2 border-noir-black py-4 text-xs font-bold tracking-widest uppercase hover:bg-noir-black hover:text-white transition-colors">
              COMPRAR AHORA
            </button>
          </div>

          {/* Delivery */}
          <div className="mt-6 p-4 bg-noir-gray text-sm">
            <div className="flex items-center gap-2 text-noir-gray-4">
              <Truck size={14} />
              <span className="text-xs">Entrega estimada: 2-5 días hábiles</span>
            </div>
          </div>

          {/* Payment logos */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {paymentLogos.map((logo) => (
              <span key={logo} className="text-[9px] font-bold bg-noir-gray px-2 py-1 text-noir-gray-4 uppercase tracking-wide border border-noir-gray-2">
                {logo}
              </span>
            ))}
          </div>

          {/* Trust */}
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

          {/* Description */}
          <div className="mt-8 border-t border-noir-gray-2 pt-6">
            <p className="text-xs font-bold tracking-widest uppercase mb-3">DESCRIPCIÓN</p>
            <p className="text-sm text-noir-gray-4 leading-relaxed">{mockProduct.description}</p>
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-20">
        <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-center mb-10 text-noir-gray-4">
          TE PODRÍA INTERESAR
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
