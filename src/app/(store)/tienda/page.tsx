import { Metadata } from "next";
import ProductCard from "@/components/store/ProductCard";

export const metadata: Metadata = {
  title: "Tienda — NOIR LOVERS",
  description: "Explora toda la colección de NOIR LOVERS. Moda masculina oscura, hecha en Bogotá, Colombia.",
};

const allProducts = [
  { id: "1", name: "Noir Oversized Tee — Black", slug: "noir-oversized-tee-black", price: 189000, images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"], sizes: ["S", "M", "L", "XL"], isNew: true },
  { id: "2", name: "Shadow Cargo Pants", slug: "shadow-cargo-pants", price: 295000, comparePrice: 350000, images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800&q=80"], sizes: ["S", "M", "L", "XL", "XXL"] },
  { id: "3", name: "Eclipse Hoodie", slug: "eclipse-hoodie", price: 249000, images: ["https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=80"], sizes: ["S", "M", "L", "XL"] },
  { id: "4", name: "Phantom Coach Jacket", slug: "phantom-coach-jacket", price: 399000, images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80"], sizes: ["M", "L", "XL"] },
  { id: "5", name: "Void Tee — Forest", slug: "void-tee-forest", price: 169000, images: ["https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80"], sizes: ["XS", "S", "M", "L", "XL"], isNew: true },
  { id: "6", name: "All Stars Pants — Cherry", slug: "all-stars-pants-cherry", price: 495000, images: ["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { id: "7", name: "One Pulse Sweatpants — Gradient Green", slug: "one-pulse-sweatpants", price: 380000, images: ["https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80"], sizes: ["XS", "S", "M", "L", "XL"] },
  { id: "8", name: "True Spirit Denim Pants — Light Blue", slug: "true-spirit-denim", price: 390000, images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"], sizes: ["S", "M", "L", "XL"], badge: "Pre-Order" },
  { id: "9", name: "Eclipse Jogger — Dark Navy", slug: "eclipse-jogger", price: 275000, images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80"], sizes: ["XS", "S", "M", "L"], isNew: true },
  { id: "10", name: "Void Tee — Ocean", slug: "void-tee-ocean", price: 169000, images: ["https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80"], sizes: ["XS", "S", "M", "L"], isNew: true },
  { id: "11", name: "Shadow Wide Leg — Charcoal", slug: "shadow-wide-leg", price: 350000, images: ["https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80"], sizes: ["S", "M", "L", "XL", "XXL"] },
  { id: "12", name: "Void Tee — Bone", slug: "void-tee-bone", price: 169000, images: ["https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=800&q=80"], sizes: ["S", "M", "L"], isNew: true },
];

export default function TiendaPage() {
  return (
    <div>
      <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-8">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">COLECCIÓN</h1>
        <p className="text-noir-gray-4 text-sm mt-2">{allProducts.length} productos</p>
        <div className="border-b border-noir-gray-2 mt-6" />
      </div>
      <div className="max-w-screen-xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {allProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
