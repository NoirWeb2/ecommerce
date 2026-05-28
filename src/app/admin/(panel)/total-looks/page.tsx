"use client";

import React, { useState, useRef } from "react";
import { Plus, Edit, Trash2, X, Check, AlertTriangle, Upload, GripVertical, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface LookProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface TotalLook {
  id: string;
  title: string;
  description: string;
  images: string[];
  products: LookProduct[];
  totalCost: number;
  status: "ACTIVE" | "DRAFT";
  createdAt: string;
}

const INITIAL_LOOKS: TotalLook[] = [
  {
    id: "1",
    title: "URBAN NOIR EXECUTIVE",
    description: "El outfit del hombre que domina la semana. Negro de la cabeza a los pies, corte preciso, actitud implacable.",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=600&q=80",
    ],
    products: [
      { id: "p1", name: "Noir Oversized Tee — Black", category: "Camisetas", price: 189000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
      { id: "p2", name: "Shadow Cargo Pants", category: "Pantalones", price: 295000, image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=100&q=80" },
      { id: "p3", name: "Eclipse Hoodie", category: "Hoodies", price: 249000, image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=100&q=80" },
    ],
    totalCost: 733000,
    status: "ACTIVE",
    createdAt: "2025-05-20",
  },
];

const EMPTY_LOOK: Omit<TotalLook, "id" | "createdAt"> = {
  title: "",
  description: "",
  images: [],
  products: [],
  totalCost: 0,
  status: "DRAFT",
};

const CATALOG_PRODUCTS: LookProduct[] = [
  { id: "p1", name: "Noir Oversized Tee — Black", category: "Camisetas", price: 189000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
  { id: "p2", name: "Shadow Cargo Pants", category: "Pantalones", price: 295000, image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=100&q=80" },
  { id: "p3", name: "Eclipse Hoodie", category: "Hoodies", price: 249000, image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=100&q=80" },
  { id: "p4", name: "Phantom Coach Jacket", category: "Chaquetas", price: 399000, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=100&q=80" },
  { id: "p5", name: "Noir Classic Tee", category: "Camisetas", price: 169000, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&q=80" },
];

export default function TotalLooksAdminPage() {
  const [looks, setLooks] = useState<TotalLook[]>(INITIAL_LOOKS);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TotalLook | null>(null);
  const [form, setForm] = useState<Omit<TotalLook, "id" | "createdAt">>(EMPTY_LOOK);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewLook, setPreviewLook] = useState<TotalLook | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [addProductSearch, setAddProductSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditTarget(null);
    setForm({ ...EMPTY_LOOK, products: [], images: [] });
    setImageUrlInput("");
    setEditorOpen(true);
  };

  const openEdit = (look: TotalLook) => {
    setEditTarget(look);
    setForm({
      title: look.title,
      description: look.description,
      images: [...look.images],
      products: [...look.products],
      totalCost: look.totalCost,
      status: look.status,
    });
    setImageUrlInput("");
    setEditorOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      toast.error("El nombre del look es requerido");
      return;
    }
    const computedTotal = form.products.reduce((acc, p) => acc + p.price, 0);
    const finalForm = { ...form, totalCost: computedTotal };

    if (editTarget) {
      setLooks((prev) => prev.map((l) => (l.id === editTarget.id ? { ...editTarget, ...finalForm } : l)));
      toast.success("Look actualizado");
    } else {
      const newLook: TotalLook = {
        ...finalForm,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split("T")[0],
      };
      setLooks((prev) => [...prev, newLook]);
      toast.success("Look creado");
    }
    setEditorOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setLooks((prev) => prev.filter((l) => l.id !== deleteId));
    setDeleteId(null);
    toast.success("Look eliminado");
  };

  const addImageFromUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url] }));
    setImageUrlInput("");
  };

  const removeImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
    });
    e.target.value = "";
  };

  const addProduct = (p: LookProduct) => {
    if (form.products.find((fp) => fp.id === p.id)) {
      toast.error("Este producto ya está en el look");
      return;
    }
    setForm((f) => ({ ...f, products: [...f.products, p] }));
  };

  const removeProduct = (id: string) => {
    setForm((f) => ({ ...f, products: f.products.filter((p) => p.id !== id) }));
  };

  const filteredCatalog = CATALOG_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(addProductSearch.toLowerCase()) &&
      !form.products.find((fp) => fp.id === p.id)
  );

  const computedTotal = form.products.reduce((acc, p) => acc + p.price, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black uppercase">TOTAL LOOKS</h1>
          <p className="text-xs text-noir-gray-4 mt-0.5">Crea y gestiona outfits completos para la tienda.</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors"
        >
          <Plus size={14} /> NUEVO LOOK
        </button>
      </div>

      {/* Looks list */}
      <div className="space-y-4">
        {looks.map((look) => (
          <div key={look.id} className="bg-white border border-noir-gray-2 p-5 flex gap-5">
            {/* Images strip */}
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

            {/* Info */}
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
                  <button onClick={() => setPreviewLook(look)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Ver">
                    <Eye size={14} />
                  </button>
                  <button onClick={() => openEdit(look)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar">
                    <Edit size={14} />
                  </button>
                  <button onClick={() => setDeleteId(look.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Products */}
              <div className="flex flex-wrap gap-2 mt-3">
                {look.products.map((p) => (
                  <span key={p.id} className="text-[9px] font-bold tracking-wide uppercase bg-noir-gray text-noir-gray-4 px-2 py-1">
                    {p.name}
                  </span>
                ))}
              </div>
              <p className="text-sm font-black mt-2">{formatPrice(look.totalCost)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setEditorOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-noir-gray-2 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-black uppercase">{editTarget ? "EDITAR LOOK" : "NUEVO LOOK"}</h2>
              <button onClick={() => setEditorOpen(false)} className="text-noir-gray-4 hover:text-noir-black">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE DEL LOOK</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Ej: URBAN NOIR EXECUTIVE"
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors uppercase font-bold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">DESCRIPCIÓN</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Describe el estilo y concepto del look..."
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">ESTADO</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as "ACTIVE" | "DRAFT" }))}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white"
                >
                  <option value="ACTIVE">Activo — visible en tienda</option>
                  <option value="DRAFT">Borrador — oculto</option>
                </select>
              </div>

              {/* Images */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">FOTOS DEL LOOK</label>

                {/* Uploaded images */}
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-20 h-24 object-cover bg-noir-gray" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 bg-noir-black/70 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-noir-gray-2 p-6 text-center cursor-pointer hover:border-noir-black transition-colors mb-2"
                >
                  <Upload size={20} className="mx-auto text-noir-gray-4 mb-2" />
                  <p className="text-xs text-noir-gray-4">Arrastra fotos aquí o <span className="font-bold text-noir-black">haz clic para subir</span></p>
                  <p className="text-[10px] text-noir-gray-4 mt-1">PNG, JPG, WEBP — máx. 5 MB por imagen</p>
                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileUpload} />
                </div>

                {/* URL input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addImageFromUrl()}
                    placeholder="O pega una URL de imagen..."
                    className="flex-1 border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors"
                  />
                  <button
                    onClick={addImageFromUrl}
                    className="border border-noir-gray-2 px-4 py-2 text-xs font-bold uppercase hover:border-noir-black transition-colors"
                  >
                    AGREGAR
                  </button>
                </div>
              </div>

              {/* Products */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">PRENDAS DEL LOOK</label>

                {/* Current products */}
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
                        <button onClick={() => removeProduct(p.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors flex-shrink-0">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                    {/* Total */}
                    <div className="flex items-center justify-between px-3 py-2.5 bg-noir-gray">
                      <span className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4">COSTO TOTAL</span>
                      <span className="text-sm font-black">{formatPrice(computedTotal)}</span>
                    </div>
                  </div>
                )}

                {/* Add product */}
                <div className="border border-noir-gray-2 p-3">
                  <p className="text-[9px] font-bold tracking-widest uppercase text-noir-gray-4 mb-2">AÑADIR PRENDA</p>
                  <input
                    type="text"
                    value={addProductSearch}
                    onChange={(e) => setAddProductSearch(e.target.value)}
                    placeholder="Buscar producto..."
                    className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors mb-2"
                  />
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {filteredCatalog.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addProduct(p)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-noir-gray transition-colors text-left"
                      >
                        <img src={p.image} alt={p.name} className="w-7 h-8 object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{p.name}</p>
                          <p className="text-[10px] text-noir-gray-4">{formatPrice(p.price)}</p>
                        </div>
                        <Plus size={12} className="text-noir-gray-4 flex-shrink-0" />
                      </button>
                    ))}
                    {filteredCatalog.length === 0 && (
                      <p className="text-xs text-noir-gray-4 text-center py-2">
                        {addProductSearch ? "Sin resultados" : "Todos los productos ya están añadidos"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-noir-gray-2 sticky bottom-0 bg-white">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors"
              >
                <Check size={13} /> {editTarget ? "GUARDAR CAMBIOS" : "CREAR LOOK"}
              </button>
              <button
                onClick={() => setEditorOpen(false)}
                className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewLook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/60" onClick={() => setPreviewLook(null)} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase">{previewLook.title}</h2>
              <button onClick={() => setPreviewLook(null)} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
            </div>
            {previewLook.images[0] && (
              <img src={previewLook.images[0]} alt={previewLook.title} className="w-full h-48 object-cover mb-4" />
            )}
            <p className="text-xs text-noir-gray-4 mb-4">{previewLook.description}</p>
            <div className="space-y-3">
              {previewLook.products.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <img src={p.image} alt={p.name} className="w-10 h-12 object-cover" />
                  <div className="flex-1">
                    <p className="text-xs font-bold">{p.name}</p>
                    <p className="text-[10px] text-noir-gray-4">{p.category}</p>
                  </div>
                  <span className="text-sm font-black">{formatPrice(p.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-noir-gray-2 mt-4 pt-3 flex items-center justify-between">
              <span className="text-[10px] font-black tracking-widest uppercase">TOTAL DEL LOOK</span>
              <span className="text-base font-black">{formatPrice(previewLook.totalCost)}</span>
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
              <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors">
                SÍ, ELIMINAR
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
