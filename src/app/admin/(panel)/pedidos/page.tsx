"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/utils";
import { ChevronDown, Loader2, X, Check, Package, Truck, MapPin } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  paymentStatus: string;
  itemCount: number;
  items: OrderItem[];
  shippingAddress: Record<string, string>;
  tracking: string | null;
  notes: string | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "text-yellow-700 bg-yellow-50 border border-yellow-200",
  CONFIRMED:  "text-blue-700 bg-blue-50 border border-blue-200",
  PROCESSING: "text-purple-700 bg-purple-50 border border-purple-200",
  SHIPPED:    "text-indigo-700 bg-indigo-50 border border-indigo-200",
  DELIVERED:  "text-green-700 bg-green-50 border border-green-200",
  CANCELLED:  "text-red-700 bg-red-50 border border-red-200",
  REFUNDED:   "text-gray-700 bg-gray-50 border border-gray-200",
};
const STATUS_LABELS: Record<string, string> = {
  PENDING:    "Pendiente",
  CONFIRMED:  "Confirmado",
  PROCESSING: "En proceso",
  SHIPPED:    "Enviado",
  DELIVERED:  "Entregado",
  CANCELLED:  "Cancelado",
  REFUNDED:   "Reembolsado",
};

const ALL_STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orders");
    if (res.ok) {
      const d = await res.json();
      setOrders(d.orders ?? []);
    } else {
      toast.error("Error al cargar pedidos");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const openOrder = (o: Order) => {
    setSelected(o);
    setEditStatus(o.status);
    setEditTracking(o.tracking ?? "");
    setEditNotes(o.notes ?? "");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: editStatus, tracking: editTracking, notes: editNotes }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => o.id === selected.id ? { ...o, status: editStatus, tracking: editTracking, notes: editNotes } : o)
      );
      setSelected(null);
      toast.success("Pedido actualizado");
    } else {
      toast.error("Error al guardar el pedido");
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">PEDIDOS</h1>

      <div className="bg-white border border-noir-gray-2 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-noir-gray-4 text-xs">
            <Loader2 size={16} className="animate-spin" /> Cargando pedidos...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-noir-gray-2 bg-noir-gray">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">PEDIDO</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">CLIENTE</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">FECHA</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">TOTAL</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ESTADO</th>
                <th className="p-4 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-gray">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-xs text-noir-gray-4">
                    No hay pedidos aún. Aparecerán aquí cuando los clientes realicen compras.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-noir-gray/50 transition-colors cursor-pointer" onClick={() => openOrder(order)}>
                    <td className="p-4">
                      <span className="text-sm font-bold">#{order.orderNumber}</span>
                      <p className="text-xs text-noir-gray-4">{order.itemCount} producto(s)</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{order.customer}</p>
                      <p className="text-xs text-noir-gray-4">{order.email}</p>
                    </td>
                    <td className="p-4 text-xs text-noir-gray-4">
                      {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                    </td>
                    <td className="p-4 text-sm font-bold">{formatPrice(order.total)}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); openOrder(order); }}
                        className="flex items-center gap-1 text-xs text-noir-gray-4 hover:text-noir-black transition-colors"
                      >
                        <ChevronDown size={13} /> Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Order detail / edit modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setSelected(null)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-noir-gray-2">
              <div>
                <h2 className="text-sm font-black uppercase">Pedido #{selected.orderNumber}</h2>
                <p className="text-xs text-noir-gray-4 mt-0.5">{selected.customer} · {selected.email}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-noir-gray-4 hover:text-noir-black">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Products */}
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-3">PRODUCTOS</p>
                <div className="space-y-2 border border-noir-gray-2 divide-y divide-noir-gray">
                  {selected.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-noir-gray-4">
                          Cant: {item.quantity}{item.size ? ` · Talla: ${item.size}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-bold">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-3 px-1">
                  <p className="text-sm font-black uppercase">Total</p>
                  <p className="text-sm font-black">{formatPrice(selected.total)}</p>
                </div>
              </div>

              {/* Shipping address */}
              {selected.shippingAddress && Object.keys(selected.shippingAddress).length > 0 && (
                <div>
                  <p className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-2 flex items-center gap-1.5">
                    <MapPin size={11} /> DIRECCIÓN DE ENVÍO
                  </p>
                  <div className="bg-noir-gray p-3 text-xs text-noir-gray-4 space-y-0.5">
                    {Object.entries(selected.shippingAddress)
                      .filter(([, v]) => v)
                      .map(([k, v]) => <p key={k}>{String(v)}</p>)
                    }
                  </div>
                </div>
              )}

              {/* Status */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-2">
                  <Package size={11} className="inline mr-1" /> ESTADO DEL PEDIDO
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              {/* Tracking */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-2">
                  <Truck size={11} className="inline mr-1" /> NÚMERO DE TRACKING (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  placeholder="Ej: TCC-123456789"
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-2">NOTAS INTERNAS</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Notas visibles solo para el admin..."
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                </button>
                <button onClick={() => setSelected(null)} className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
                  CANCELAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
