import { prisma } from "@/lib/prisma";
import TotalLooksClient from "./TotalLooksClient";
import Link from "next/link";

export const revalidate = 0;

async function getLooks() {
  try {
    const looks = await prisma.totalLook.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return looks;
  } catch {
    return [];
  }
}

export default async function TotalLooksPage() {
  const looks = await getLooks();

  return (
    <div>
      <div className="max-w-screen-xl mx-auto px-6 pt-14 pb-10 text-center">
        <p className="text-[9px] font-black tracking-[0.35em] uppercase text-noir-gray-4 mb-3">
          CURADOS POR NOSOTROS
        </p>
        <h1 className="text-5xl md:text-[80px] font-black uppercase tracking-tight leading-none mb-4">
          TOTAL LOOKS
        </h1>
        <p className="text-xs text-noir-gray-4 max-w-md mx-auto">
          Outfits completos pensados por NOIR LOVERS. Cada look lleva la combinación exacta de prendas.
        </p>
      </div>

      <div className="bg-noir-black text-white py-3 px-4 text-center">
        <p className="text-[10px] font-bold tracking-[0.15em] uppercase">
          TOTAL LOOK = CORTE DE CABELLO GRATIS
          <span className="mx-3 opacity-40">·</span>
          Mínimo 3 prendas
          <span className="mx-3 opacity-40">·</span>
          Válido en Barber Brothers
          <span className="mx-3 opacity-40">·</span>
          Solo Bogotá
        </p>
      </div>

      <div className="border-t border-noir-gray-2">
        <TotalLooksClient looks={looks} />
      </div>

      <div className="bg-noir-gray py-16 text-center px-6 border-t border-noir-gray-2">
        <p className="text-[9px] font-black tracking-[0.35em] uppercase text-noir-gray-4 mb-3">
          ARMA EL TUYO
        </p>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-5">
          EXPLORA LA COLECCIÓN
        </h2>
        <Link href="/tienda" className="inline-block bg-noir-black text-white text-[10px] font-black tracking-widest uppercase px-10 py-4 hover:bg-black transition-colors">
          VER TODOS LOS PRODUCTOS
        </Link>
      </div>
    </div>
  );
}