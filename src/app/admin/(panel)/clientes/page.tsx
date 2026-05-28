"use client";

import { useState, useEffect, useCallback } from "react";
import { formatPrice, getInitials } from "@/lib/utils";
import { Edit, Trash2, X, Check, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  total: number;
  segment: string;
  lastPurchase: string | null;
  city: string;
  createdAt: string;
}

const SEGMENT_COLORS: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  FREQUENT: "bg-green-50 text-green-700 border-green-200",
  VIP: "bg-amber-50 text-amber-700 border-amber-200",
  INACTIVE: "bg-gray-50 text-gray-600 border-gray-200",
};
const SEGMENT_LABELS: Record<string, string> = {
  NEW: "Nuevo", FREQUENT: "Frecuente", VIP: "VIP", INACTIVE: "Inactivo",
};

const TABS = [
  { key: "ALL", label: "Todos" },
  { key: "NEW", label: "Nuevos" },
  { key: "FREQUENT", label: "Frecuentes" },
  { key: "VIP", label: "VIP" },
  { key: "INACTIVE", label: "Inactivos" },
];

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  // Edit state
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/customers");
    if (res.ok) {
      const d = await res.json();
      setCustomers(d.customers ?? []);
    } else {
      toast.error("Error al cargar clientes");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filtered = activeTab === "ALL"
    ? customers
    : customers.filter((c) => c.segment === activeTab);

  const countByTab = (key: string) =>
    key === "ALL" ? customers.length : customers.filter((c) => c.segment === key).length;

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setEditName(c.name);
    setEditPhone(c.phone);
  };

  const handleSaveEdit = async () => {
    if (!editCustomer) return;
    setSaving(true);
    const res = await fetch(`/api/admin/customers/${editCustomer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, phone: editPhone }),
    });
    if (res.ok) {
      setCustomers((prev) =>
        prev.map((c) => c.id === editCustomer.id ? { ...c, name: editName, phone: editPhone } : c)
      );
      setEditCustomer(null);
      toast.success("Cliente actualizado");
    } else {
      toast.error("Error al guardar");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/customers/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setCustomers((prev) => prev.filter((c) => c.id !== deleteId));
      setDeleteId(null);
      toast.success("Cliente eliminado");
    } else {
      toast.error("Error al eliminar");
    }
    setDeleting(false);
  };

  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">CLIENTES</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${
              activeTab === t.key
                ? "border-noir-black bg-noir-black text-white"
                : "border-noir-gray-2 bg-white hover:border-noir-black"
            }`}
          >
            {t.label}
            <span className="ml-1.5 opacity-60 font-normal">({countByTab(t.key)})</span>
          </button>
        ))}
      </div>

      <div className="bg-white border border-noir-gray-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-noir-gray-4 text-xs">
            <Loader2 size={16} className="animate-spin" /> Cargando clientes...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-noir-gray-2 bg-noir-gray">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">CLIENTE</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">CIUDAD</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">PEDIDOS</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">TOTAL GASTADO</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ÚLTIMA COMPRA</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">SEGMENTO</th>
                <th className="p-4 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-gray">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-noir-gray-4">
                    No hay clientes en este segmento.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-noir-gray/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-noir-black text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                          {getInitials(c.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-noir-gray-4">{c.email}</p>
                          {c.phone && <p className="text-xs text-noir-gray-4">{c.phone}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-noir-gray-4">{c.city || "—"}</td>
                    <td className="p-4 text-sm font-bold text-center">{c.orders}</td>
                    <td className="p-4 text-sm font-bold">{formatPrice(c.total)}</td>
                    <td className="p-4 text-xs text-noir-gray-4">{c.lastPurchase ?? "—"}</td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${SEGMENT_COLORS[c.segment] ?? ""}`}>
                        {SEGMENT_LABELS[c.segment] ?? c.segment}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="text-noir-gray-4 hover:text-noir-black transition-colors"
                          title="Editar"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="text-noir-gray-4 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setEditCustomer(null)} />
          <div className="relative bg-white w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase">EDITAR CLIENTE</h2>
              <button onClick={() => setEditCustomer(null)} className="text-noir-gray-4 hover:text-noir-black">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">EMAIL</label>
                <p className="text-sm text-noir-gray-4 border border-noir-gray-2 px-4 py-2.5 bg-noir-gray">
                  {editCustomer.email}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TELÉFONO</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-5">
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "GUARDANDO..." : "GUARDAR"}
              </button>
              <button onClick={() => setEditCustomer(null)} className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white w-full max-w-sm p-6 text-center">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-sm font-black uppercase mb-2">¿ELIMINAR CLIENTE?</h2>
            <p className="text-xs text-noir-gray-4 mb-6">
              Se eliminará el cliente y todos sus datos. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? "..." : "SÍ, ELIMINAR"}
              </button>
              <button onClick={() => setDeleteId(null)} className="border border-noir-gray-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
