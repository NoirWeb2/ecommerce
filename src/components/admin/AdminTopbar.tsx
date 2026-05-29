"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "ADMIN",
  "/admin/pedidos": "ADMIN",
  "/admin/productos": "ADMIN",
  "/admin/clientes": "ADMIN",
  "/admin/marketing": "ADMIN",
  "/admin/inventario": "ADMIN",
  "/admin/contenido": "ADMIN",
  "/admin/descuentos": "ADMIN",
  "/admin/informes": "ADMIN",
  "/admin/ajustes": "ADMIN",
};

export default function AdminTopbar() {
  const pathname = usePathname();

  return (
    <div className="bg-noir-black text-white px-6 py-3 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-sm font-black tracking-[0.1em] uppercase">
          NOIR
          <span className="inline-block w-2 h-2 mx-0.5 rounded-full border border-white align-middle" />
          LOVERS
        </span>
        <span className="text-white/30 text-xs">|</span>
        <span className="text-xs text-white/60 uppercase tracking-widest">
          {PAGE_TITLES[pathname] || "ADMIN"}
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs text-white/60">
        <span>admin@noirlovers.com</span>
        <Link href="/" target="_blank" className="flex items-center gap-1 hover:text-white transition-colors">
          <ExternalLink size={12} /> Ver tienda
        </Link>
       <button
  onClick={() => {
    localStorage.removeItem("admin-auth");
    sessionStorage.clear();
    window.location.href = "/admin/login";
  }}
  className="flex items-center gap-1 hover:text-white transition-colors"
>
  <LogOut size={12} /> Salir
</button>
      </div>
    </div>
  );
}
