import { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

export const metadata: Metadata = { title: "Mis Compras — NOIR LOVERS" };

export default function ComprasPage() {
  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">TUS COMPRAS</h1>
      <div className="bg-white p-12 text-center">
        <ShoppingBag size={40} className="text-noir-gray-3 mx-auto mb-4" />
        <p className="text-sm text-noir-gray-4">Aún no tienes pedidos.</p>
        <a href="/tienda" className="inline-block mt-4 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          EXPLORAR COLECCIÓN
        </a>
      </div>
    </div>
  );
}
