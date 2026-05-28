import { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, CheckCircle, Gift, Tag, User, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Mi Cuenta — NOIR LOVERS" };

const stats = [
  { label: "PEDIDOS", value: "0", icon: <ShoppingBag size={20} />, href: "/cuenta/compras", color: "text-blue-500" },
  { label: "ENTREGADOS", value: "0", icon: <CheckCircle size={20} />, href: "/cuenta/compras", color: "text-green-500" },
  { label: "REWARDS", value: "0", icon: <Gift size={20} />, href: "/cuenta/rewards", color: "text-orange-500" },
  { label: "CUPONES ACTIVOS", value: "0", icon: <Tag size={20} />, href: "/cuenta/rewards", color: "text-purple-500" },
];

const quickLinks = [
  { label: "TUS DATOS", sub: "Nombre, email, teléfono", icon: <User size={18} />, href: "/cuenta/datos" },
  { label: "TUS COMPRAS", sub: "Historial de pedidos", icon: <ShoppingBag size={18} />, href: "/cuenta/compras" },
  { label: "DIRECCIONES", sub: "Direcciones guardadas", icon: <MapPin size={18} />, href: "/cuenta/direcciones" },
  { label: "REWARDS", sub: "Puntos y cupones", icon: <Gift size={18} />, href: "/cuenta/rewards" },
];

export default function CuentaDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-black uppercase mb-1">HOLA, AMIR 👋</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white p-4 hover:shadow-sm transition-shadow group"
          >
            <div className={`${stat.color} mb-3`}>{stat.icon}</div>
            <p className="text-2xl font-black">{stat.value}</p>
            <p className="text-[10px] font-bold tracking-widest uppercase text-noir-gray-4 mt-1">
              {stat.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="bg-white p-4 flex items-center justify-between group hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="text-noir-gray-4">{item.icon}</div>
              <div>
                <p className="text-xs font-bold tracking-widest uppercase">{item.label}</p>
                <p className="text-xs text-noir-gray-4 mt-0.5">{item.sub}</p>
              </div>
            </div>
            <span className="text-noir-gray-4 group-hover:translate-x-1 transition-transform">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
