import { Metadata } from "next";
import { Gift, Tag } from "lucide-react";

export const metadata: Metadata = { title: "Mis Rewards — NOIR LOVERS" };

export default function RewardsPage() {
  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">REWARDS</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gift size={24} className="text-orange-500" />
            <h2 className="font-black uppercase text-sm">Tus Puntos</h2>
          </div>
          <p className="text-4xl font-black">0</p>
          <p className="text-xs text-noir-gray-4 mt-1">puntos acumulados</p>
        </div>
        <div className="bg-white p-6">
          <div className="flex items-center gap-3 mb-4">
            <Tag size={24} className="text-purple-500" />
            <h2 className="font-black uppercase text-sm">Cupones Activos</h2>
          </div>
          <p className="text-4xl font-black">0</p>
          <p className="text-xs text-noir-gray-4 mt-1">cupones disponibles</p>
        </div>
      </div>
      <div className="bg-noir-gray p-6 rounded">
        <p className="text-xs font-bold tracking-widest uppercase mb-2">¿CÓMO GANAR PUNTOS?</p>
        <ul className="text-sm text-noir-gray-4 space-y-2">
          <li>• Cada $1.000 COP en compras = 1 punto</li>
          <li>• Referir un amigo = 50 puntos</li>
          <li>• Cumpleaños = 100 puntos de regalo</li>
          <li>• Reseñar un producto = 10 puntos</li>
        </ul>
      </div>
    </div>
  );
}
