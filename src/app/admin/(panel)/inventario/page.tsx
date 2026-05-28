"use client";

import { useState, useEffect, useCallback } from "react";
import { Edit, Check, X, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Variant { id: string; size: string; stock: number }
interface InventoryProduct {
  id: string;
  name: string;
  sku: string | null;
  variants: Variant[];
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

function getSizes(variants: Variant[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const v of variants) {
    if (v.size) map[v.size] = v.stock;
  }
  return map;
}

function totalStock(variants: Variant[]) {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export default function InventarioPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editSizes, setEditSizes] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/inventory");
    if (res.ok) {
      const d = await res.json();
      setProducts(d.products ?? []);
    } else {
      toast.error("Error al cargar inventario");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const startEdit = (p: InventoryProduct) => {
    setEditId(p.id);
    setEditSizes(getSizes(p.variants));
  };

  const cancelEdit = () => { setEditId(null); setEditSizes({}); };

  const saveEdit = async (productId: string) => {
    setSaving(true);
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, sizes: editSizes }),
    });
    if (res.ok) {
      // Refresh inventory to get updated variants
      await loadInventory();
      setEditId(null);
      setEditSizes({});
      toast.success("Inventario guardado");
    } else {
      toast.error("Error al guardar inventario");
    }
    setSaving(false);
  };

  const editTotal = Object.values(editSizes).reduce((a, b) => a + (b || 0), 0);

  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">INVENTARIO</h1>

      <div className="bg-white border border-noir-gray-2 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-noir-gray-4 text-xs">
            <Loader2 size={16} className="animate-spin" /> Cargando inventario...
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-noir-gray-2 bg-noir-gray">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">PRODUCTO</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">SKU</th>
                {ALL_SIZES.map((s) => (
                  <th key={s} className="text-center text-[10px] font-bold tracking-widest uppercase p-4">{s}</th>
                ))}
                <th className="text-center text-[10px] font-bold tracking-widest uppercase p-4">TOTAL</th>
                <th className="p-4 w-28" />
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-gray">
              {products.map((item) => {
                const isEditing = editId === item.id;
                const sizes = getSizes(item.variants);
                const total = totalStock(item.variants);
                return (
                  <tr key={item.id} className={`transition-colors ${isEditing ? "bg-noir-gray/20" : "hover:bg-noir-gray/30"}`}>
                    <td className="p-4 text-sm font-medium max-w-[180px]">{item.name}</td>
                    <td className="p-4 text-xs text-noir-gray-4 font-mono">{item.sku ?? "—"}</td>
                    {ALL_SIZES.map((s) => {
                      const stock = isEditing ? (editSizes[s] ?? 0) : (sizes[s] ?? 0);
                      return (
                        <td key={s} className="p-4 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              min={0}
                              value={editSizes[s] ?? ""}
                              placeholder="0"
                              onChange={(e) => setEditSizes({ ...editSizes, [s]: Number(e.target.value) })}
                              className="w-14 text-center border border-noir-gray-2 px-1 py-1 text-sm outline-none focus:border-noir-black"
                            />
                          ) : (
                            <span className={`text-sm font-bold ${stock === 0 ? "text-red-400" : stock < 5 ? "text-orange-500" : "text-noir-black"}`}>
                              {stock}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-4 text-center">
                      <span className={`text-sm font-bold ${(isEditing ? editTotal : total) === 0 ? "text-red-600" : ""}`}>
                        {isEditing ? editTotal : total}
                      </span>
                    </td>
                    <td className="p-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={saving}
                            className="flex items-center gap-1.5 bg-noir-black text-white px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
                          >
                            {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
                            {saving ? "..." : "GUARDAR"}
                          </button>
                          <button onClick={cancelEdit} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Cancelar">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(item)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar inventario">
                          <Edit size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={ALL_SIZES.length + 4} className="p-8 text-center text-xs text-noir-gray-4">
                    Sin productos en inventario.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
