import { Metadata } from "next";
import ProductCard from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
title: "Tienda — NOIR LOVERS",
description: "Explora toda la colección de NOIR LOVERS. Moda masculina oscura, hecha en Bogotá, Colombia.",
};

export const dynamic = "force-dynamic";

// 💡 FIX: Bloqueamos la talla "UNICO" para que no salga en las tarjetas de la tienda
const ALLOWED_SIZES = ["S", "M", "L", "XL"];

async function getProducts() {
try {
  const products = await prisma.product.findMany({
    where: { 
      status: "ACTIVE",
      isAddon: false // 🛡️ Bloquea el gel eGo y la Barbería
    },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return products;
} catch {
  return [];
}
}

export default async function TiendaPage() {
const products = await getProducts();

return (
  <div>
    <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-8">
      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">COLECCIÓN</h1>
      <p className="text-noir-gray-4 text-sm mt-2">{products.length} productos</p>
      <div className="border-b border-noir-gray-2 mt-6" />
    </div>
    <div className="max-w-screen-xl mx-auto px-6 pb-20">
      {products.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-noir-gray-4 text-sm">No hay productos disponibles aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              slug={p.slug}
              price={p.price}
              comparePrice={p.comparePrice ?? undefined}
              images={p.images.map((img) => img.url)}
              // 💡 FIX: Filtramos las tallas para que UNICO no aparezca
              sizes={[...new Set(p.variants
                .map((v) => v.size)
                .filter((size) => size && ALLOWED_SIZES.includes(size))
              )] as string[]}
              isNew={p.isNew}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);
}