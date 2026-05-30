"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Edit, Trash2, X, Check, AlertTriangle, Upload, GripVertical, Eye, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface LookProduct { id: string; name: string; category: string; price: number; image: string; }
interface TotalLook { id: string; title: string; description: string; images: string[]; products: LookProduct[]; totalCost: number; status: "ACTIVE" | "DRAFT"; createdAt: string; }

const EMPTY_LOOK: Omit<TotalLook, "id" | "createdAt"> = { title: "", description: "", images: [], products: [], totalCost: 0, status: "DRAFT" };

// ── Subidor Real a Cloudinary ──
function ImageUploader({ images, onChange }: { images: string[]; onChange: (urls: string[]) => void; }) {
const fileRef = useRef<HTMLInputElement>(null);
const [uploading, setUploading] = useState(false);

const handleFiles = async (files: FileList | null) => {
  if (!files) return;
  setUploading(true);
  const newUrls: string[] = [];
  for (const file of Array.from(files)) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "noir-lovers/total-looks");
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (res.ok) {
      const data = await res.json();
      newUrls.push(data.url);
    }
  }
  onChange([...images, ...newUrls]);
  setUploading(false);
};

return (
  <div>
    <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">FOTOS DEL LOOK</label>
    {images.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative group w-20 h-24 bg-noir-gray">
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onChange(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
          </div>
        ))}
      </div>
    )}
    <div onClick={() => !uploading && fileRef.current?.click()} className={`border-2 border-dashed border-noir-gray-2 p-6 text-center cursor-pointer hover:border-noir-black transition-colors ${uploading ? "opacity-50" : ""}`}>
      {uploading ? <Loader2 className="mx-auto animate-spin mb-2" size={20} /> : <Upload size={20} className="mx-auto text-noir-gray-4 mb-2" />}
      <p className="text-xs text-noir-gray-4">{uploading ? "Subiendo a Cloudinary..." : "Haz clic para subir fotos"}</p>
      <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  </div>
);
}

export default function TotalLooksAdminPage() {
const [looks, setLooks] = useState<TotalLook[]>([]);
const [catalog, setCatalog] = useState<LookProduct[]>([]);
const [loading, setLoading] = useState(true);

const [editorOpen, setEditorOpen] = useState(false);
const [editTarget, setEditTarget] = useState<TotalLook | null>(null);
const [form, setForm] = useState<Omit<TotalLook, "id" | "createdAt">>(EMPTY_LOOK);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [previewLook, setPreviewLook] = useState<TotalLook | null>(null);
const [addProductSearch, setAddProductSearch] = useState("");

const loadData = useCallback(async () => {
  setLoading(true);
  try {
    const [resLooks, resProds] = await Promise.all([
      fetch("/api/admin/total-looks", { cache: "no-store" }),
      fetch("/api/admin/products", { cache: "no-store" })
    ]);
    if (resLooks.ok) {
      const d = await resLooks.json();
      setLooks(d.looks || []);
    }
    if (resProds.ok) {
      const d = await resProds.json();
      // Mapeamos los productos reales de tu BD para usarlos en el catálogo
      setCatalog(d.products.map((p: any) => ({
        id: p.id, name: p.name, category: p.category?.name || "Sin categoría",
        price: p.price, image: p.images?.[0]?.url || "/placeholder-product.jpg"
      })));
    }
  } catch (error) {
    toast.error("Error cargando datos");
  }
  setLoading(false);
}, []);

useEffect(() => { loadData(); }, [loadData]);

const saveAllLooks = async (newLooks: TotalLook[], message: string) => {
  setLooks(newLooks);
  const res = await fetch("/api/admin/total-looks", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ looks: newLooks })
  });
  if (res.ok) toast.success(message);
  else toast.error("Error al guardar en base de datos");
};

const openNew = () => { setEditTarget(null); setForm(EMPTY_LOOK); setEditorOpen(true); };
const openEdit = (look: TotalLook) => { setEditTarget(look); setForm(look); setEditorOpen(true); };

const handleSave = () => {
  if (!form.title.trim()) { toast.error("El nombre es requerido"); return; }
  const computedTotal = form.products.reduce((acc, p) => acc + p.price, 0);
  const finalForm = { ...form, totalCost: computedTotal };

  let newLooks;
  if (editTarget) {
    newLooks = looks.map((l) => (l.id === editTarget.id ? { ...editTarget, ...finalForm } : l));
  } else {
    newLooks = [{ ...finalForm, id: Date.now().toString(), createdAt: new Date().toISOString() }, ...looks];
  }
  
  saveAllLooks(newLooks, editTarget ? "Look actualizado" : "Look creado");
  setEditorOpen(false);
};

const handleDelete = () => {
  if (!deleteId) return;
  saveAllLooks(looks.filter((l) => l.id !== deleteId), "Look eliminado");
  setDeleteId(null);
};

const addProduct = (p: LookProduct) => {
  if (form.products.find((fp) => fp.id === p.id)) { toast.error("Este producto ya está en el look"); return; }
  setForm((f) => ({ ...f, products: [...f.products, p] }));
};

const removeProduct = (id: string) => {
  setForm((f) => ({ ...f, products: f.products.filter((p) => p.id !== id) }));
};

const filteredCatalog = catalog.filter((p) => p.name.toLowerCase().includes(addProductSearch.toLowerCase()) && !form.products.find((fp) => fp.id === p.id));
const computedTotal = form.products.reduce((acc, p) => acc + p.price, 0);

if (loading) return <div className="py-20 text-center text-xs text-noir-gray-4"><Loader2 className="animate-spin mx-auto mb-2" /> Cargando Total Looks...</div>;

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-black uppercase">TOTAL LOOKS</h1>
        <p className="text-xs text-noir-gray-4 mt-0.5">Crea y gestiona outfits completos para la tienda.</p>
      </div>
      <button onClick={openNew} className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
        <Plus size={14} /> NUEVO LOOK
      </button>
    </div>

    {looks.length === 0 ? (
      <div className="bg-white border border-noir-gray-2 p-12 text-center text-sm text-noir-gray-4">
        No hay Total Looks creados aún.
      </div>
    ) : (
      <div className="space-y-4">
        {looks.map((look) => (
          <div key={look.id} className="bg-white border border-noir-gray-2 p-5 flex gap-5">
            <div className="flex gap-2 flex-shrink-0">
              {look.images.slice(0, 2).map((img, i) => (
                <div key={i} className="relative w-16 h-20 bg-noir-gray overflow-hidden">
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))}
              {look.images.length === 0 && (
                <div className="w-16 h-20 bg-noir-gray flex items-center justify-center">
                  <Upload size={14} className="text-noir-gray-4" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-black uppercase">{look.title}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${look.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-600 border border-gray-200"}`}>
                      {look.status === "ACTIVE" ? "Activo" : "Borrador"}
                    </span>
                  </div>
                  <p className="text-xs text-noir-gray-4 line-clamp-1 max-w-md">{look.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setPreviewLook(look)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Ver"><Eye size={14} /></button>
                  <button onClick={() => openEdit(look)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar"><Edit size={14} /></button>
                  <button onClick={() => setDeleteId(look.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {look.products.map((p) => (
                  <span key={p.id} className="text-[9px] font-bold tracking-wide uppercase bg-noir-gray text-noir-gray-4 px-2 py-1">{p.name}</span>
                ))}
              </div>
              <p className="text-sm font-black mt-2">{formatPrice(look.totalCost)}</p>
            </div>
          </div>
        ))}
      </div>
    )}

    {editorOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setEditorOpen(false)} />
        <div className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-noir-gray-2 sticky top-0 bg-white z-10">
            <h2 className="text-sm font-black uppercase">{editTarget ? "EDITAR LOOK" : "NUEVO LOOK"}</h2>
            <button onClick={() => setEditorOpen(false)} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE DEL LOOK</label>
              <input type="text" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ej: URBAN NOIR EXECUTIVE" className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors uppercase font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">DESCRIPCIÓN</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe el estilo y concepto del look..." className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">ESTADO</label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "ACTIVE" | "DRAFT" }))} className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white">
                <option value="ACTIVE">Activo — visible en tienda</option>
                <option value="DRAFT">Borrador — oculto</option>
              </select>
            </div>

            <ImageUploader images={form.images} onChange={(urls) => setForm({ ...form, images: urls })} />

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">PRENDAS DEL LOOK (DESDE TU CATÁLOGO)</label>
              {form.products.length > 0 && (
                <div className="border border-noir-gray-2 divide-y divide-noir-gray mb-3">
                  {form.products.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-3">
                      <GripVertical size={12} className="text-noir-gray-4 flex-shrink-0" />
                      <img src={p.image} alt={p.name} className="w-8 h-10 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-[10px] text-noir-gray-4">{p.category} · {formatPrice(p.price)}</p>
                      </div>
                      <button onClick={() => removeProduct(p.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors flex-shrink-0"><X size={13} /></button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2.5 bg-noir-gray">
                    <span className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4">COSTO TOTAL</span>
                    <span className="text-sm font-black">{formatPrice(computedTotal)}</span>
                  </div>
                </div>
              )}
              <div className="border border-noir-gray-2 p-3">
                <p className="text-[9px] font-bold tracking-widest uppercase text-noir-gray-4 mb-2">AÑADIR PRENDA</p>
                <input type="text" value={addProductSearch} onChange={(e) => setAddProductSearch(e.target.value)} placeholder="Buscar producto..." className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors mb-2" />
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filteredCatalog.map((p) => (
                    <button key={p.id} onClick={() => addProduct(p)} className="w-full flex items-center gap-3 p-2 hover:bg-noir-gray transition-colors text-left">
                      <img src={p.image} alt={p.name} className="w-7 h-8 object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{p.name}</p>
                        <p className="text-[10px] text-noir-gray-4">{formatPrice(p.price)}</p>
                      </div>
                      <Plus size={12} className="text-noir-gray-4 flex-shrink-0" />
                    </button>
                  ))}
                  {filteredCatalog.length === 0 && <p className="text-xs text-noir-gray-4 text-center py-2">{addProductSearch ? "Sin resultados" : "Todos los productos ya están añadidos"}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-noir-gray-2 sticky bottom-0 bg-white">
            <button onClick={handleSave} className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
              <Check size={13} /> {editTarget ? "GUARDAR CAMBIOS" : "CREAR LOOK"}
            </button>
            <button onClick={() => setEditorOpen(false)} className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Delete Confirm */}
    {deleteId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setDeleteId(null)} />
        <div className="relative bg-white w-full max-w-sm p-6 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-black uppercase mb-2">¿ELIMINAR LOOK?</h2>
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