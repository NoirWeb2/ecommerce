"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, ShoppingBag, MapPin, Gift, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { label: "DASHBOARD", href: "/cuenta", icon: <LayoutDashboard size={16} /> },
  { label: "TUS DATOS", href: "/cuenta/datos", icon: <User size={16} /> },
  { label: "TUS COMPRAS", href: "/cuenta/compras", icon: <ShoppingBag size={16} /> },
  { label: "DIRECCIONES", href: "/cuenta/direcciones", icon: <MapPin size={16} /> },
  { label: "REWARDS", href: "/cuenta/rewards", icon: <Gift size={16} /> },
];

export default function CuentaSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearUser } = useAuthStore();

  const mockUser = { name: "Amir Torres", email: "amirtorreslo1625@gmail.com" };
  const displayUser = user || mockUser;

  const handleLogout = () => {
    clearUser();
    document.cookie = "auth-token=; path=/; max-age=0";
    toast.success("Sesión cerrada");
    router.push("/");
  };

  return (
    <aside className="w-60 flex-shrink-0 hidden md:block">
      {/* Profile card */}
      <div className="bg-white p-6 text-center mb-2">
        <div className="w-14 h-14 rounded-full bg-noir-black text-white text-xl font-black flex items-center justify-center mx-auto mb-3">
          {getInitials(displayUser.name || "Usuario")}
        </div>
        <p className="text-sm font-bold">{displayUser.name}</p>
        <p className="text-xs text-noir-gray-4 mt-0.5">{displayUser.email}</p>
      </div>

      {/* Nav */}
      <nav className="bg-white">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-3.5 text-xs font-bold tracking-widest transition-colors border-b border-noir-gray ${
                isActive
                  ? "bg-noir-black text-white"
                  : "text-noir-black hover:bg-noir-gray"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-bold tracking-widest text-noir-gray-4 hover:text-noir-black transition-colors border-b border-noir-gray"
        >
          <LogOut size={16} />
          CERRAR SESIÓN
        </button>
      </nav>
    </aside>
  );
}
