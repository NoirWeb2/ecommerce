import { Metadata } from "next";
import ProductCard from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

async function getCategoryProducts(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
    });
    if (!category) return { category: null, products: [] };

    const products = await prisma.product.findMany({
      where: { status: "ACTIVE", categoryId: category.id },
      include: {
        images: { orderBy: { order: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { category, products };
  } catch {
    return { category: null, products: [] };
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { category } = await getCategoryProducts(slug);
  const name = category?.name.toUpperCase() || slug.toUpperCase();
  return {
    title: `${name} — NOIR LOVERS`,
    description: `Explora nuestra colección de ${name.toLowerCase()} en NOIR LOVERS. Moda masculina oscura, Bogotá, Colombia.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { category, products } = await getCategoryProducts(slug);
  const categoryName = category?.name.toUpperCase() || slug.toUpperCase();

  const mapped = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    comparePrice: p.comparePrice ?? undefined,
    images: p.images.map((img) => img.url),
    sizes: [...new Set(p.variants.map((v) => v.size).filter(Boolean))] as string[],
    isNew: p.isNew,
  }));

  return (
    <div className="min-h-screen">
      <div className="max-w-screen-xl mx-auto px-6 pt-12 pb-8">
        <p className="text-xs font-medium tracking-widest text-noir-gray-4 uppercase mb-2">TIENDA</p>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">{categoryName}</h1>
        <div className="border-b border-noir-gray-2 mt-6" />
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pb-20">
        {mapped.length === 0 ? (
          <div className="py-20 text-center text-noir-gray-4">
            <p className="text-sm">No hay productos en esta categoría aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {mapped.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}