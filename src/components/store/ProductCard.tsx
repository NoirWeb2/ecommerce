"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingBag, ZoomIn } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import { toast } from "sonner";
import { nanoid } from "nanoid";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  sizes?: string[];
  badge?: string;
  isNew?: boolean;
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  images,
  sizes = [],
  badge,
  isNew,
}: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const { addItem } = useCartStore();

  const mainImage = images[0] || "/placeholder-product.jpg";
  const hoverImage = images[1] || mainImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Selecciona una talla");
      return;
    }
    addItem({
      id: nanoid(),
      productId: id,
      name,
      price,
      image: mainImage,
      size: selectedSize || undefined,
      quantity: 1,
      slug,
    });
    toast.success("Agregado al carrito");
  };

  return (
    <div
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link href={`/producto/${slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-noir-gray product-image-hover">
          {/* Badge */}
          {(badge || isNew) && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-noir-black text-white text-[10px] font-bold tracking-wider uppercase px-2 py-1">
                {badge || "NUEVO"}
              </span>
            </div>
          )}

          <Image
            src={hovered && hoverImage !== mainImage ? hoverImage : mainImage}
            alt={name}
            fill
            className="object-cover transition-all duration-500"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />

          {/* Hover actions */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-noir-black text-white text-xs font-bold py-2 tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={12} />
              AGREGAR
            </button>
            <Link
              href={`/producto/${slug}`}
              className="bg-white border border-noir-gray-2 p-2 flex items-center justify-center hover:bg-noir-gray transition-colors"
            >
              <ZoomIn size={14} />
            </Link>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 space-y-1">
        <Link
          href={`/producto/${slug}`}
          className="text-sm font-medium hover:underline line-clamp-2 block"
        >
          {name}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{formatPrice(price)}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-noir-gray-4 line-through">
              {formatPrice(comparePrice)}
            </span>
          )}
        </div>

        {/* Sizes */}
        {sizes.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s === selectedSize ? null : s)}
                className={`text-[10px] font-medium px-2 py-0.5 border transition-colors ${
                  selectedSize === s
                    ? "border-noir-black bg-noir-black text-white"
                    : "border-noir-gray-2 hover:border-noir-gray-3"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
