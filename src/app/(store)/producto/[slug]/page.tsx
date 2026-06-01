import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductoClient from "./ProductoClient";

export const dynamic = "force-dynamic"; // 🚀 Bala de plata anti-caché
export const revalidate = 0;

// 💡 FIX: Lista de tallas permitidas para la ropa
const ALLOWED_SIZES = ["S", "M", "L", "XL"];

async function getProduct(slug: string) {
try {
  return await prisma.product.findUnique({
    where: { slug, status: "ACTIVE" },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
      category: true,
    },
  });
} catch {
  return null;
}
}

async function getRelated(categoryId: string | null, excludeId: string) {
if (!categoryId) return [];
try {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", categoryId, id: { not: excludeId }, isAddon: false }, // También evitamos que el gel salga en "Relacionados"
    include: { images: { orderBy: { order: "asc" } }, variants: true },
    take: 4,
  });
  return products;
} catch {
  return [];
}
}

async function getAddon() {
try {
  return await prisma.product.findFirst({
    where: { 
      status: "ACTIVE", 
      tags: { has: "ADDON" } 
    },
    include: {
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });
} catch {
  return null;
}
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
const { slug } = await params;
const product = await getProduct(slug);
if (!product) return { title: "Producto no encontrado — NOIR LOVERS" };
return {
  title: `${product.name} — NOIR LOVERS`,
  description: product.description || "Moda masculina oscura, hecha en Bogotá, Colombia.",
};
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
const { slug } = await params;
const product = await getProduct(slug);
if (!product) notFound();

const related = await getRelated(product.categoryId, product.id);

const showAddon = product.tags?.includes("HAS_ADDON") || false;
const addon = showAddon ? await getAddon() : null;

const mapped = {
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: product.price,
  comparePrice: product.comparePrice,
  description: product.description,
  images: product.images.map((img) => img.url),
  // 💡 FIX: Filtramos las tallas para que solo pasen S, M, L, XL
  sizes: [...new Set(product.variants
    .map((v) => v.size)
    .filter((size) => size && ALLOWED_SIZES.includes(size))
  )] as string[],
  category: product.category?.name || "",
};

const relatedMapped = related.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  price: p.price,
  comparePrice: p.comparePrice ?? undefined,
  images: p.images.map((img) => img.url),
  // 💡 FIX: Filtramos también los relacionados
  sizes: [...new Set(p.variants
    .map((v) => v.size)
    .filter((size) => size && ALLOWED_SIZES.includes(size))
  )] as string[],
}));

const addonMapped = addon ? {
  id: addon.id,
  name: addon.name,
  slug: addon.slug,
  price: addon.price,
  images: addon.images.map((img) => img.url),
  sizes: [...new Set(addon.variants.map((v) => v.size).filter(Boolean))] as string[],
} : null;

return <ProductoClient product={mapped} related={relatedMapped} addon={addonMapped} />;
}