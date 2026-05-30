"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Tag, Copy, Trash2, Edit, X, Check, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Coupon {
id: string; code: string; type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
value: number; usedCount: number; maxUses: number | null; isActive: boolean; endDate: string | null;
}

const BLANK_FORM: { code: string; type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING"; value: string; minCartValue: string; maxUses: string; endDate: string; firstPurchase: boolean } = { code: "", type: "PERCENTAGE", value: "", minCartValue: "", maxUses: "", endDate: "", firstPurchase: false };

export default function DescuentosPage() {
const [coupons, setCoupons] = useState<Coupon[]>([]);
const [loading, setLoading] = useState(true);
const [showForm, setShowForm] = useState(false);
const [saving, setSaving] = useState(false);
const [editId, setEditId] = useState<string | null>(null);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [form, setForm] = useState(BLANK_FORM);

const loadData = useCallback(async () => {
  setLoading(true);
  const res = await fetch("/api/admin/coupons", { cache: "no-store" });
  if (res.ok) {
    const d = await res.json();
    setCoupons(d.coupons.map((c: any) => ({
      ...c,
      endDate: c.endDate ? new Date(c.endDate).toISOString().split("T")[0] : null
    })));
  }
  setLoading(false);
}, []);

useEffect(() => { loadData(); }, [loadData]);

const openCreate = () => { setEditId(null); setForm(BLANK_FORM); setShowForm(true); };

const openEdit = (c: Coupon) => {
  setEditId(c.id);
  setForm({
    code: c.code, type: c.type, value: c.value.toString(), minCartValue: "",
    maxUses: c.maxUses?.toString() ?? "", endDate: c.endDate ?? "", firstPurchase: false,
  });
  setShowForm(true);
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  
  if (editId) {
    const res = await fetch(`/api/admin/coupons/${editId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value) })
    });
    if (res.ok) { toast.success("Cupón actualizado"); await loadData(); }
    else toast.error("Error al actualizar");
  } else {
    const res = await fetch("/api/admin/coupons", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, value: Number(form.value) })
    });
    if (res.ok) { toast.success("Cupón creado"); await loadData(); }
    else toast.error("Error al crear. Quizá el código ya existe.");
  }
  
  setSaving(false);
  setShowForm(false);
};

const handleDelete = async () => {
  if (!deleteId) return;
  const res = await fetch(`/api/admin/coupons/${deleteId}`, { method: "DELETE" });
  if (res.ok) { setCoupons((prev) => prev.filter((c) => c.id !== deleteId)); toast.success("Cupón eliminado"); }
  else toast.error("Error al eliminar");
  setDeleteId(null);
};

const toggleActive = async (c: Coupon) => {
  const newState = !c.isActive;
  setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, isActive: newState } : x)));
  await fetch(`/api/admin/coupons/${c.id}`, {
    method: "PATCH", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: newState })
  });
};

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-black uppercase">DESCUENTOS</h1>
      <button onClick={openCreate} className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
        <Plus size={14} /> CREAR CUPÓN
      </button>
    </div>

    <div className="bg-white border border-noir-gray-2 min-h-[200px]">
      {loading ? (
        <div className="flex items-center justify-center py-16 text-xs text-noir-gray-4">
          <Loader2 size={16} className="animate-spin mr-2" /> Cargando cupones...
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-noir-gray-2 bg-noir-gray">
              <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">CÓDIGO</th>
              <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">TIPO</th>
              <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">USOS</th>
              <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">EXPIRACIÓN</th>
              <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ESTADO</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-noir-gray">
            {coupons.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-xs text-noir-gray-4">No hay cupones creados aún.</td></tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-noir-gray/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-noir-gray-4" />
                      <span className="text-sm font-bold font-mono">{c.code}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-noir-gray-4">
                    {c.type === "PERCENTAGE" ? `${c.value}% descuento` : c.type === "FIXED" ? `$${c.value.toLocaleString("es-CO")} descuento` : "Envío gratis"}
                  </td>
                  <td className="p-4 text-sm">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="p-4 text-xs text-noir-gray-4">{c.endDate || "Sin expiración"}</td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(c)} className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${c.isActive ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                      {c.isActive ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success("Código copiado"); }} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Copiar código">
                        <Copy size={14} />
                      </button>
                      <button onClick={() => openEdit(c)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors" title="Eliminar">
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

    {showForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setShowForm(false)} />
        <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black uppercase">{editId ? "EDITAR CUPÓN" : "NUEVO CUPÓN"}</h2>
            <button onClick={() => setShowForm(false)} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">CÓDIGO</label>
              <div className="flex gap-2">
                <input required type="text" placeholder="DESCUENTO20" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="flex-1 border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black font-mono uppercase transition-colors" />
                <button type="button" onClick={() => setForm({ ...form, code: Math.random().toString(36).substring(2, 10).toUpperCase() })} className="border border-noir-gray-2 px-3 py-2.5 text-xs hover:border-noir-black transition-colors">AUTO</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TIPO</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })} className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black bg-white transition-colors">
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED">Monto fijo ($)</option>
                  <option value="FREE_SHIPPING">Envío gratis</option>
                </select>
              </div>
              {form.type !== "FREE_SHIPPING" && (
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">VALOR</label>
                  <input type="number" placeholder={form.type === "PERCENTAGE" ? "20" : "50000"} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">USO MÁXIMO</label>
                <input type="number" placeholder="Ilimitado" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">FECHA EXPIRACIÓN</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60">
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {editId ? "GUARDAR CAMBIOS" : "CREAR CUPÓN"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">CANCELAR</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Delete confirm */}
    {deleteId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setDeleteId(null)} />
        <div className="relative bg-white w-full max-w-sm p-6 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-black uppercase mb-2">¿ELIMINAR CUPÓN?</h2>
          <p className="text-xs text-noir-gray-4 mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors">SÍ, ELIMINAR</button>
            <button onClick={() => setDeleteId(null)} className="border border-noir-gray-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">CANCELAR</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}