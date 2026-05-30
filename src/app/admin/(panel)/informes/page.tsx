import { formatPrice } from "@/lib/utils";
import { Users, Activity, Globe, Monitor, Smartphone } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

// 💡 FIX DE TYPESCRIPT: Le decimos qué tipo de datos va a tener este arreglo
const salesByMonth: { month: string; revenue: number; orders: number; monthIndex: number }[] = [];

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
          { label: "