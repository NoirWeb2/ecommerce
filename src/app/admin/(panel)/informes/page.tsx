"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Users, Activity, Globe, Monitor, Smartphone } from "lucide-react";

const salesByMonth = [
  { month: "Enero", revenue: 0, orders: 0 },
  { month: "Febrero", revenue: 0, orders: 0 },
  { month: "Marzo", revenue: 0, orders: 0 },
  { month: "Abril", revenue: 0, orders: 0 },
  { month: "Mayo", revenue: 1067000, orders: 3 },
];

const topProducts = [
  { name: "Noir Oversized Tee — Black", units: 15, revenue: 2835000 },
  { name: "Shadow Cargo Pants", units: 8, revenue: 2360000 },
  { name: "Eclipse Hoodie", units: 6, revenue: 1494000 },
];

// Simulated online users data
const MOCK_ONLINE = [
  { id: "1", name: "Carlos R.", location: "Bogotá", page: "/producto/noir-oversized-tee", device: "desktop", time: "2m" },
  { id: "2", name: "Visitante", location: "Medellín", page: "/tienda", device: "mobile", time: "5m" },
  { id: "3", name: "Miguel T.", location: "Cali", page: "/", device: "mobile", time: "1m" },
  { id: "4", name: "Visitante", location: "Barranquilla", page: "/categoria/camisetas", device: "desktop", time: "8m" },
];

export default function InformesPage() {
  const [onlineCount, setOnlineCount] = useState(MOCK_ONLINE.length);
  const maxRevenue = Math.max(...salesByMonth.map((m) => m.revenue), 1);

  // Simulate count fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 3) + 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">INFORMES</h1>

      {/* ── Online users (live) ── */}
      <div className="bg-white border border-noir-gray-2 p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
            </span>
            <h2 className="text-xs font-black uppercase tracking-widest">USUARIOS EN LÍNEA</h2>
          </div>
          <span className="text-2xl font-black">{onlineCount}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Visitando tienda", value: onlineCount, icon: <Globe size={14} /> },
            { label: "En checkout", value: 0, icon: <Activity size={14} /> },
            { label: "Desktop", value: 2, icon: <Monitor size={14} /> },
            { label: "Móvil", value: onlineCount - 2, icon: <Smartphone size={14} /> },
          ].map((s) => (
            <div key={s.label} className="bg-noir-gray p-3">
              <div className="flex items-center gap-1.5 text-noir-gray-4 mb-1">
                {s.icon}
                <span className="text-[10px] font-medium">{s.label}</span>
              </div>
              <p className="text-lg font-black">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="border border-noir-gray-2 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-noir-gray border-b border-noir-gray-2">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-3">USUARIO</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-3">UBICACIÓN</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-3">PÁGINA ACTUAL</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-3">DISPOSITIVO</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-3">HACE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-gray">
              {MOCK_ONLINE.slice(0, onlineCount).map((u) => (
                <tr key={u.id} className="hover:bg-noir-gray/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-noir-black text-white text-[9px] font-black flex items-center justify-center">
                        {u.name[0]}
                      </div>
                      <span className="text-xs font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-noir-gray-4">{u.location}</td>
                  <td className="p-3 text-xs font-mono text-noir-gray-4 truncate max-w-[160px]">{u.page}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase text-noir-gray-4">
                      {u.device === "mobile" ? "📱 Móvil" : "🖥 Desktop"}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-noir-gray-4">{u.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white border border-noir-gray-2 p-6 mb-6">
        <h2 className="text-xs font-black uppercase tracking-widest mb-6">VENTAS POR MES</h2>
        <div className="flex items-end gap-3 h-40">
          {salesByMonth.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-noir-gray-4">{m.revenue > 0 ? formatPrice(m.revenue) : ""}</span>
              <div
                className="w-full bg-noir-black transition-all duration-500"
                style={{ height: `${(m.revenue / maxRevenue) * 120}px`, minHeight: m.revenue > 0 ? "4px" : "2px", opacity: m.revenue > 0 ? 1 : 0.1 }}
              />
              <span className="text-[10px] text-noir-gray-4">{m.month.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white border border-noir-gray-2 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4">PRODUCTOS TOP</h2>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-black text-noir-gray-3 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-noir-gray-4">{p.units} unidades</p>
                </div>
                <span className="text-xs font-bold flex-shrink-0">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-noir-gray-2 p-6">
          <h2 className="text-xs font-black uppercase tracking-widest mb-4">RESUMEN</h2>
          <div className="space-y-4">
            {[
              { label: "Ingresos totales", value: formatPrice(1067000) },
              { label: "Ticket promedio", value: formatPrice(355667) },
              { label: "Pedidos totales", value: "3" },
              { label: "Clientes totales", value: "3" },
              { label: "Usuarios en línea ahora", value: String(onlineCount) },
              { label: "Conversión", value: "—" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-noir-gray-4">{item.label}</span>
                <span className="text-sm font-bold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
