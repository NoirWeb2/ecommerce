import { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, ShoppingCart, Users, Archive, AlertCircle, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard — Admin NOIR LOVERS" };
export const dynamic = "force-dynamic"; // 🚀 Siempre lee datos frescos

const STATUS_COLORS: Record<string, string> = {
PENDING: "text-yellow-600 bg-yellow-50",
CONFIRMED: "text-blue-600 bg-blue-50",
SHIPPED: "text-indigo-600 bg-indigo-50",
DELIVERED: "text-green-600 bg-green-50",
CANCELLED: "text-red-600 bg-red-50",
};

const STATUS_LABELS: Record<string, string> = {
PENDING: "Pendiente",
CONFIRMED: "Confirmado",
SHIPPED: "Enviado",
DELIVERED: "Entregado",
CANCELLED: "Cancelado",
};

export default async function AdminDashboard() {
// 1. Consultar la base de datos en tiempo real
const [ordersCount, clientsCount, stockAgg, revenueAgg, recentOrders] = await Promise.all([
  prisma.order.count(),
  prisma.user.count({ where: { role: "CUSTOMER" } }),
  prisma.variant.aggregate({ _sum: { stock: true } }),
  // Sumar solo los pedidos que NO estén cancelados o reembolsados
  prisma.order.aggregate({ 
    _sum: { total: true }, 
    where: { status: { notIn: ["CANCELLED", "REFUNDED"] } } 
  }),
  prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  })
]);

const totalRevenue = revenueAgg._sum.total || 0;
const totalStock = stockAgg._sum.stock || 0;
const pendingCount = await prisma.order.count({ where: { status: "PENDING" } });

const stats = [
  { label: "INGRESOS TOTALES", value: formatPrice(totalRevenue), icon: <TrendingUp size={18} />, color: "text-green-500", trend: "Real" },
  { label: "PEDIDOS", value: String(ordersCount), icon: <ShoppingCart size={18} />, color: "text-blue-500", trend: "Histórico" },
  { label: "CLIENTES", value: String(clientsCount), icon: <Users size={18} />, color: "text-purple-500", trend: "Registrados" },
  { label: "STOCK TOTAL", value: `${totalStock} uds`, icon: <Archive size={18} />, color: "text-orange-500", trend: "Disponible" },
];

return (
  <div>
    <div className="mb-6">
      <h1 className="text-xl font-black uppercase">BUENAS, EMPECEMOS.</h1>
      <p className="text-sm text-noir-gray-4 mt-1">Panel de control de NOIR LOVERS.</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white p-5 border border-noir-gray-2">
          <div className="flex items-start justify-between mb-3">
            <p className="text-[10px] font-bold tracking-widest uppercase text-noir-gray-4">
              {stat.label}
            </p>
            <div className={stat.color}>{stat.icon}</div>
          </div>
          <p className="text-2xl font-black">{stat.value}</p>
          {stat.trend && (
            <p className="text-xs text-noir-gray-4 mt-1 font-medium">{stat.trend}</p>
          )}
        </div>
      ))}
    </div>

    {/* Alert */}
    {pendingCount > 0 && (
      <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-center gap-2 mb-6">
        <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
        <p className="text-xs text-amber-800">
          <strong>{pendingCount} pedido(s) pendientes de confirmar</strong>{" "}
          <Link href="/admin/pedidos" className="underline">→</Link>
        </p>
      </div>
    )}

    {/* Recent orders */}
    <div className="bg-white border border-noir-gray-2">
      <div className="flex items-center justify-between p-5 border-b border-noir-gray-2">
        <h2 className="text-xs font-black uppercase tracking-widest">PEDIDOS RECIENTES</h2>
        <Link
          href="/admin/pedidos"
          className="text-xs text-noir-gray-4 hover:text-noir-black transition-colors flex items-center gap-1"
        >
          Ver todos <ArrowRight size={12} />
        </Link>
      </div>
      <div className="divide-y divide-noir-gray">
        {recentOrders.length === 0 ? (
          <p className="p-6 text-sm text-noir-gray-4 text-center">Aún no hay pedidos registrados.</p>
        ) : (
          recentOrders.map((order) => {
            // Obtener el nombre del cliente de la dirección de envío o del email
            const addr = order.shippingAddress as any;
            const customerName = addr?.firstName ? `${addr.firstName} ${addr.lastName || ""}` : order.email;

            return (
              <Link
                key={order.orderNumber}
                href={`/admin/pedidos`}
                className="flex items-center justify-between px-5 py-4 hover:bg-noir-gray/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-bold">#{order.orderNumber}</p>
                  <p className="text-xs text-noir-gray-4 mt-0.5">{customerName}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  </div>
);
}