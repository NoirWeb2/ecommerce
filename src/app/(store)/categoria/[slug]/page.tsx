import { Metadata } from "next";
import ProductCard from "@/components/store/ProductCard";

const CATEGORY_NAMES: Record<string, string> = {
  camisetas: "CAMISETAS",
  pantalones: "PANTALONES",
  hoodies: "HOODIES",
  chaquetas: "CHAQUETAS",
};

const mockProducts = [
  { id: "1", name: "All Stars Pants — Cherry", slug: "all-stars-pants-cherry", price: 495000, images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=800&q=80"], sizes: ["XS", "S", "M", "L", "XL", "XXL"], badge: "Fit Mujer" },
  { id: "2", name: "One Pulse Sweatpants — Gradient Green", slug: "one-pulse-sweatpants-green", price: 380000, images: ["https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80"], sizes: ["XS", "S", "M", "L", "XL"] },
  { id: "3", name: "The True Spirit Denim Pants — Light Blue", slug: "true-spirit-denim-pants-blue", price: 390000, images: ["https://images.unsplash.com/photo-1560243563-062bfc001d68?w=800&q=80"], sizes: ["XS", "S", "M", "L", "XL"], badge: "Pre-Order" },
  { id: "4", name: "Noir Slim Cargo — Black", slug: "noir-slim-cargo-black", price: 320000, images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"], sizes: ["S", "M", "L", "XL"] },
  { id: "5", name: "Shadow Wide Leg — Charcoal", slug: "shadow-wide-leg-charcoal", price: 350000, images: ["https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=800&q=80"], sizes: ["S", "M", "L", "XL", "XXL"] },
  { id: "6", name: "Eclipse Jogger — Dark Navy", slug: "eclipse-jogger-dark-navy", price: 275000, images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80"], sizes: ["XS", "S", "M", "L"], isNew: true },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = CATEGORY_NAMES[slug] || slug.toUpperCase();
  return {
    title: `${name} — NOIR LOVERS`,
    description: `Explora nuestra colección de ${name.toLowerCase()} en NOIR LOVERS. Moda masculina oscura, Bogotá, Colombia.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = CATEGORY_NAMES[slug] || slug.toUpperCase();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-8">
        <p className="text-xs font-medium tracking-widest text-noir-gray-4 uppercase mb-2">
          TIENDA
        </p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">
          {categoryName}
        </h1>
        <div className="border-b border-noir-gray-2 mt-6" />
      </div>

      {/* Products */}
      <div className="max-w-screen-xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {mockProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </div>
  );
}
