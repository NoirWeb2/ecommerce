import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import ProductoClient from "./ProductoClient";

export const revalidate = 0;

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
      where: { status: "ACTIVE", categoryId, id: { not: excludeId } },
      include: { images: { orderBy: { order: "asc" } }, variants: true },
      take: 4,
    });
    return products;
  } catch {
    return [];
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

  const mapped = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    comparePrice: product.comparePrice,
    description: product.description,
    images: product.images.map((img) => img.url),
    sizes: [...new Set(product.variants.map((v) => v.size).filter(Boolean))] as string[],
    category: product.category?.name || "",
  };

  const relatedMapped = related.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice ?? undefined,
    images: p.images.map((img) => img.url),
    sizes: [...new Set(p.variants.map((v) => v.size).filter(Boolean))] as string[],
  }));

  return <ProductoClient product={mapped} related={relatedMapped} />;
}