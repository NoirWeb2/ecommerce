"use client";

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

interface AddonData {
id: string;
name: string;
slug: string;
price: number;
images: string[];
sizes: string[];
}

// 💡 FIX: Ahora el botón recibe los datos reales del Add-on
function AddTheLookButton({ addon }: { addon: AddonData | null }) {
const { addItem, items } = useCartStore();

// Si no hay Add-on configurado o activo en la base de datos, no dibujamos el botón
if (!addon) return null;

const isAdded = items.some((i) => i.productId === addon.id);

const handleAdd = () => {
  if (isAdded) return;
  
  // 💡 FIX: Unimos las fotos
  const mainImg = addon.images[0] || "/placeholder-product.jpg";
  const partnerLogo = addon.images[1] || "";
  const combinedImageString = `${mainImg}||${partnerLogo}`;

  addItem({
    id: nanoid(),
    productId: addon.id,
    name: addon.name,
    price: addon.price,
    image: combinedImageString, 
    slug: addon.slug,
    quantity: 1,
  });
  toast.success(`${addon.name} añadido al carrito`);
};

// Usamos la segunda foto del addon como "logo de la barbería", si no hay, no mostramos nada raro
const partnerLogo = addon.images[1] || ""; 

return (
  <div className="border border-noir-gray-2 overflow-hidden mb-8">
    <button onClick={handleAdd} disabled={isAdded}
      className={`w-full transition-all duration-300 ${isAdded ? "bg-noir-gray cursor-default" : "bg-noir-black hover:bg-black"}`}>
      <div className="flex items-center justify-center py-3.5 px-4 gap-2">
        {isAdded ? <CheckIcon size={15} className="text-green-600" /> : <Scissors size={15} className="text-white" />}
        <div className="text-left">
          <p className={`text-xs font-black tracking-[0.1em] uppercase ${isAdded ? "text-noir-gray-4" : "text-white"}`}>
            {isAdded ? "AÑADIDO AL CARRITO" : "ADD THE LOOK"}
          </p>
          <p className={`text-[9px] tracking-wide font-medium ${isAdded ? "text-noir-gray-4" : "text-white/60"}`}>
            {isAdded ? addon.name : `${addon.name} — +${formatPrice(addon.price)}`}
          </p>
        </div>
      </div>
    </button>
    
    {/* 💡 FIX: Solo mostramos la barra gris de aliado si le subiste una segunda foto (Logo) al Add-on en el Admin */}
    {partnerLogo && (
      <div className="bg-noir-gray px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <img src={partnerLogo} alt="Logo Aliado" className="h-6 w-auto object-contain mix-blend-multiply" />
          <div>
            <p className="text-[9px] font-black tracking-widest uppercase text-noir-gray-4">MARCA ALIADA</p>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

// 💡 FIX: Agregamos el addon a las props
export default function ProductoClient({ product, related, addon }: { product: ProductData; related: RelatedProduct[]; addon: AddonData | null }) {
const [currentImage, setCurrentImage] = useState(0);
const [selectedSize, setSelectedSize] = useState<string | null>(null);
const { addItem } = useCartStore();

const handleAddToCart = () => {
  // Si el producto tiene talla "UNICO", lo agrega directo. Si