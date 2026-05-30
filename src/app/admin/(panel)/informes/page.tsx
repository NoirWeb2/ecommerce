import { formatPrice } from "@/lib/utils";
import { Users, Activity, Globe, Monitor, Smartphone } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // 🚀 Siempre lee datos frescos

export default async function InformesPage() {
// Consultas a BD
const allOrders = await prisma.order.findMany({
  where: { status: { notIn: ["CANCELLED", "REFUNDED"] } }
});
const clientsCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
const orderItems = await prisma.orderItem.findMany({ include: { product: true } });

// Calcular totales
const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
const totalOrders = allOrders.length;
const ticketPromedio = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

// Calcular ventas por mes (últimos 5 meses)
const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const currentMonth = new Date().getMonth();

const salesByMonth = [];
for (let i = 4; i >= 0; i--) {
  let m = currentMonth - i;
  if (m < 0) m += 12;
  salesByMonth.push({ month: monthNames[m], revenue: 0, orders: 0, monthIndex: m });
}

allOrders.forEach(o => {
  const m = new Date(o.createdAt).getMonth();
  const target = salesByMonth.find(x => x.monthIndex === m);
  if (target) {
    target.revenue += o.total;
    target.orders += 1;
  }
});

const maxRevenue = Math.max(...salesByMonth.map((m) => m.revenue), 1);

// Calcular productos Top
const productSales: Record<string, { name: string; units: number; revenue: number }> = {};
orderItems.forEach(item => {
  if (!productSales[item.productId]) {
    productSales[item.productId] = { name: item.name, units: 0, revenue: 0 };
  }
  productSales[item.productId].units += item.quantity;
  productSales[item.productId].revenue += (item.price * item.quantity);
});

const topProducts = Object.values(productSales)
  .sort((a, b) => b.revenue - a.revenue)
  .slice(0, 3);

// Placeholder para usuarios online
const onlineCount = 1;

return (
  <div>
    <h1 className="text-xl font-black uppercase mb-6">INFORMES</h1>

    {/* ── Online users (estático) ── */}
    <div className="bg-white border border-noir-gray-2 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
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
          { label: "Desktop", value: 1, icon: <Monitor size={14} /> },
          { label: "Móvil", value: 0, icon: <Smartphone size={14} /> },
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
    </div>

    {/* Revenue chart */}
    <div className="bg-white border border-noir-gray-2 p-6 mb-6">
      <h2 className="text-xs font-black uppercase tracking-widest mb-6">VENTAS POR MES (ÚLTIMOS 5)</h2>
      <div className="flex items-end gap-3 h-40">
        {salesByMonth.map((m) => (
          <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-noir-gray-4">{m.revenue > 0 ? formatPrice(m.revenue) : ""}</span>
            <div
              className="w-full bg-noir-black transition-all duration-500"
              style={{ height: `${(m.revenue / maxRevenue) * 120}px`, minHeight: m.revenue > 0 ? "4px" : "2px", opacity: m.revenue > 0 ? 1 : 0.1 }}
            />
            <span className="text-[10px] text-noir-gray-4">{m.month}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Top products */}
      <div className="bg-white border border-noir-gray-2 p-6">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4">PRODUCTOS TOP</h2>
        <div className="space-y-3">
          {topProducts.length === 0 ? (
            <p className="text-xs text-noir-gray-4 py-4">Aún no hay ventas registradas.</p>
          ) : (
            topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-black text-noir-gray-3 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-noir-gray-4">{p.units} unidades</p>
                </div>
                <span className="text-xs font-bold flex-shrink-0">{formatPrice(p.revenue)}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white border border-noir-gray-2 p-6">
        <h2 className="text-xs font-black uppercase tracking-widest mb-4">RESUMEN HISTÓRICO</h2>
        <div className="space-y-4">
          {[
            { label: "Ingresos totales", value: formatPrice(totalRevenue) },
            { label: "Ticket promedio", value: formatPrice(ticketPromedio) },
            { label: "Pedidos totales", value: String(totalOrders) },
            { label: "Clientes registrados", value: String(clientsCount) },
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