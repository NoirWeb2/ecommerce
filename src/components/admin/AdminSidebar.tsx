"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, ShoppingCart, Package, Users, Mail, Archive,
  Layout, Tag, BarChart2, Settings, LogOut, ExternalLink, Zap, Layers,
} from "lucide-react";

const navItems = [
  { label: "Inicio", href: "/admin", icon: <Home size={16} /> },
  { label: "Pedidos", href: "/admin/pedidos", icon: <ShoppingCart size={16} /> },
  { label: "Productos", href: "/admin/productos", icon: <Package size={16} /> },
  { label: "Total Looks", href: "/admin/total-looks", icon: <Layers size={16} /> },
  { label: "Clientes", href: "/admin/clientes", icon: <Users size={16} /> },
  { label: "Marketing", href: "/admin/marketing", icon: <Mail size={16} /> },
  { label: "Inventario", href: "/admin/inventario", icon: <Archive size={16} /> },
  { label: "Páginas", href: "/admin/paginas", icon: <Layout size={16} /> },
  { label: "Descuentos", href: "/admin/descuentos", icon: <Tag size={16} /> },
  { label: "Informes", href: "/admin/informes", icon: <BarChart2 size={16} /> },
  { label: "Ajustes", href: "/admin/ajustes", icon: <Settings size={16} /> },
  { label: "Caché", href: "/admin/cache", icon: <Zap size={16} /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 bg-white border-r border-noir-gray-2 flex flex-col fixed top-0 left-0 h-full z-30">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-noir-gray-2">
        <span className="text-sm font-black tracking-[0.1em] uppercase">
          NOIR
          <span className="inline-block w-2 h-2 mx-0.5 rounded-full border border-noir-black align-middle" />
          LOVERS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-5 py-2.5 text-xs font-medium transition-colors ${
                isActive
                  ? "bg-noir-black text-white"
                  : "text-noir-gray-4 hover:text-noir-black hover:bg-noir-gray"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-noir-gray-2 p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-noir-gray-4 hover:text-noir-black transition-colors px-2 py-1.5"
        >
          <ExternalLink size={13} /> Ver tienda
        </Link>
        <Link
          href="/admin/login"
          className="flex items-center gap-2 text-xs text-noir-gray-4 hover:text-noir-black transition-colors px-2 py-1.5"
        >
          <LogOut size={13} /> Salir
        </Link>
        <div className="px-2 pt-2">
          <p className="text-[10px] font-bold text-noir-black">NOIR LOVERS</p>
          <p className="text-[10px] text-noir-gray-4">Hace 11.0 · 3.0km</p>
        </div>
      </div>
    </aside>
  );
}
