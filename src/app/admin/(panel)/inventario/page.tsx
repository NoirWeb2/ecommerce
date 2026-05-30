"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, Loader2, Save, Check } from "lucide-react";
import { toast } from "sonner";

interface Variant { id: string; size: string; stock: number; }
interface Product { id: string; name: string; sku: string | null; variants: Variant[]; }

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "UNICO"];

export default function InventarioPage() {
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [search, setSearch] = useState("");

// Estado local para los inputs de stock (ProductID -> Size -> Quantity)
const [stockState, setStockState] = useState<Record<string, Record<string, number>>>({});

const loadData = useCallback(async () => {
  setLoading(true);
  const res = await fetch("/api/admin/inventory", { cache: "no-store" });
  if (res.ok) {
    const data = await res.json();
    setProducts(data.products || []);
    
    const initialStock: Record<string, Record<string, number>> = {};
    data.products.forEach((p: Product) => {
      initialStock[p.id] = {};
      SIZES.forEach(size => {
        const variant = p.variants.find(v => v.size === size);
        initialStock[p.id][size] = variant ? variant.stock : 0;
      });
    });
    setStockState(initialStock);
  }
  setLoading(false);
}, []);

useEffect(() => { loadData(); }, [loadData]);

const handleStockChange = (productId: string, size: string, value: string) => {
  const num = parseInt(value) || 0;
  setStockState(prev => ({
    ...prev,
    [productId]: { ...prev[productId], [size]: Math.max(0, num) }
  }));
};

const handleSave = async () => {
  setSaving(true);
  const res = await fetch("/api/admin/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock: stockState })
  });
  if (res.ok) {
    toast.success("Inventario actualizado correctamente");
    await loadData();
  } else {
    toast.error("Error al guardar inventario");
  }
  setSaving(false);
};

const filtered = products.filter(p => 
  p.name.toLowerCase().includes(search.toLowerCase()) || 
  (p.sku || "").toLowerCase().includes(search.toLowerCase())
);

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-black uppercase">INVENTARIO</h1>
      <button 
        onClick={handleSave} 
        disabled={saving || loading}
        className="flex items-center gap-2 bg-noir-black text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
      >
        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
      </button>
    </div>

    <div className="bg-white border border-noir-gray-2 overflow-hidden">
      <div className="p-4 border-b border-noir-gray-2">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-noir-gray-2 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-noir-gray-4 text-xs">
          <Loader2 size={16} className="animate-spin" /> Cargando inventario...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-noir-gray-2 bg-noir-gray">
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4 min-w-[200px]">PRODUCTO</th>
                <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">SKU</th>
                {SIZES.map(size => (
                  <th key={size} className="text-center text-[10px] font-bold tracking-widest uppercase p-4 w-16">{size}</th>
                ))}
                <th className="text-center text-[10px] font-bold tracking-widest uppercase p-4 w-20">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-noir-gray">
              {filtered.map((p) => {
                const productStock = stockState[p.id] || {};
                const total = SIZES.reduce((sum, size) => sum + (productStock[size] || 0), 0);

                return (
                  <tr key={p.id} className="hover:bg-noir-gray/30 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                    </td>
                    <td className="p-4 text-xs text-noir-gray-4 font-mono">{p.sku || "—"}</td>
                    {SIZES.map(size => (
                      <td key={size} className="p-2">
                        <input
                          type="number"
                          min="0"
                          value={productStock[size] === 0 ? "" : productStock[size]}
                          placeholder="0"
                          onChange={(e) => handleStockChange(p.id, size, e.target.value)}
                          className="w-14 text-center border border-noir-gray-2 py-1.5 text-xs outline-none focus:border-noir-black transition-colors mx-auto block"
                        />
                      </td>
                    ))}
                    <td className="p-4 text-center">
                      <span className={`text-sm font-bold ${total === 0 ? "text-red-600" : "text-noir-black"}`}>
                        {total}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-xs text-noir-gray-4">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);
}