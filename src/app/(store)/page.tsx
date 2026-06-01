async function getProducts() {
try {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", isAddon: false },
    include: { images: { orderBy: { order: "asc" } }, variants: true, category: true },
    orderBy: { createdAt: "desc" },
  });
  return products;
} catch (error) {
  // 👇 ESTA LÍNEA NOS DIRÁ LA VERDAD
  console.error("🔥 ERROR FATAL EN PRISMA (TIENDA):", error);
  return [];
}
}