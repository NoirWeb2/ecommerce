"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Search, Edit, Trash2, Eye, X, Check, AlertTriangle, Tag, ChevronRight, Upload, ImageIcon, Loader2, ToggleLeft, ToggleRight, Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface ProductImage { id?: string; url: string; order: number }
interface Variant { id: string; size: string; stock: number }
interface Product {
id: string;
name: string;
sku: string | null;
price: number;
status: "ACTIVE" | "DRAFT" | "ARCHIVED";
category: { id: string; name: string } | null;
images: ProductImage[];
variants: Variant[];
isFeatured: boolean;
}
interface Category {
id: string;
name: string;
slug: string;
image: string | null; // 💡 NUEVO
_count: { products: number };
}

function totalStock(variants: Variant[]) {
return variants.reduce((sum, v) => sum + v.stock, 0);
}

// ── Image Uploader Component ─────────────────────────────────────────────────

function ImageUploader({ images, onChange, single = false }: {
images: string[];
onChange: (urls: string[]) => void;
single?: boolean; // 💡 NUEVO: para que las categorías solo suban 1 foto
}) {
const fileRef = useRef<HTMLInputElement>(null);
const [dragging, setDragging] = useState(false);
const [uploading, setUploading] = useState(false);

const uploadFile = useCallback(async (file: File): Promise<string | null> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "noir-lovers/products");
  const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
  if (!res.ok) return null;
  const data = await res.json();
  return data.url ?? null;
}, []);

const handleFiles = async (files: FileList | File[]) => {
  setUploading(true);
  const newUrls: string[] = [];
  for (const file of Array.from(files)) {
    if (!file.type.startsWith("image/")) continue;
    const url = await uploadFile(file);
    if (url) newUrls.push(url);
    if (single) break; // Si es single, solo sube la primera
  }
  onChange(single ? newUrls : [...images, ...newUrls]);
  setUploading(false);
  if (newUrls.length) toast.success(`Imagen subida`);
};

const removeImage = (idx: number) => {
  onChange(images.filter((_, i) => i !== idx));
};

return (
  <div>
    <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">
      {single ? "IMAGEN DE CATEGORÍA" : "IMÁGENES"}
    </label>

    {images.length > 0 && (
      <div className="flex gap-2 flex-wrap mb-3">
        {images.map((url, i) => (
          <div key={i} className="relative w-20 h-24 bg-noir-gray overflow-hidden group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    )}

    {(!single || images.length === 0) && (
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center py-5 gap-2 ${
          dragging ? "border-noir-black bg-noir-gray" : "border-noir-gray-2 hover:border-noir-black"
        } ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {uploading ? (
          <>
            <Loader2 size={20} className="text-noir-gray-4 animate-spin" />
            <p className="text-xs text-noir-gray-4">Subiendo...</p>
          </>
        ) : (
          <>
            <Upload size={18} className="text-noir-gray-4" />
            <p className="text-xs text-noir-gray-4 text-center px-4">
              Arrastra una imagen aquí o haz clic
            </p>
          </>
        )}
      </div>
    )}

    <input
      ref={fileRef}
      type="file"
      accept="image/*"
      multiple={!single}
      className="hidden"
      onChange={(e) => e.target.files && handleFiles(e.target.files)}
    />
  </div>
);
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductosAdminPage() {
const [products, setProducts] = useState<Product[]>([]);
const [categories, setCategories] = useState<Category[]>([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [filterCat, setFilterCat] = useState<string>("all");

const [editProduct, setEditProduct] = useState<Product | null>(null);
const [editForm, setEditForm] = useState<{
  name: string; sku: string; price: number; stock: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED"; categoryName: string;
  description: string; images: string[]; isFeatured: boolean;
} | null>(null);
const [saving, setSaving] = useState(false);

const [deleteId, setDeleteId] = useState<string | null>(null);
const [deleting, setDeleting] = useState(false);

const [createOpen, setCreateOpen] = useState(false);
const [createForm, setCreateForm] = useState<{ name: string; sku: string; price: number; stock: number; status: "ACTIVE" | "DRAFT" | "ARCHIVED"; categoryName: string; description: string; images: string[]; isFeatured: boolean }>({ name: "", sku: "", price: 0, stock: 0, status: "DRAFT", categoryName: "", description: "", images: [], isFeatured: false });
const [creating, setCreating] = useState(false);

// Categories
const [newCatName, setNewCatName] = useState("");
const [deleteCatId, setDeleteCatId] = useState<string | null>(null);

// 💡 NUEVO: Modal de edición de categoría
const [editCatForm, setEditCatForm] = useState<{ id: string; name: string; image: string } | null>(null);
const [savingCat, setSavingCat] = useState(false);

const loadData = useCallback(async () => {
  setLoading(true);
  const [prodRes, catRes] = await Promise.all([
    fetch("/api/admin/products", { cache: "no-store" }),
    fetch("/api/admin/categories", { cache: "no-store" }),
  ]);
  if (prodRes.ok) {
    const d = await prodRes.json();
    setProducts(d.products ?? []);
  }
  if (catRes.ok) {
    const d = await catRes.json();
    setCategories(d.categories ?? []);
  }
  setLoading(false);
}, []);

useEffect(() => { loadData(); }, [loadData]);

const filtered = products.filter((p) => {
  const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
  const matchCat = filterCat === "all" || p.category?.name === filterCat;
  return matchSearch && matchCat;
});

const openEdit = (p: Product) => {
  setEditProduct(p);
  setEditForm({
    name: p.name,
    sku: p.sku ?? "",
    price: p.price,
    stock: totalStock(p.variants),
    status: p.status,
    categoryName: p.category?.name ?? "",
    description: "",
    images: p.images.map((img) => img.url),
    isFeatured: p.isFeatured ?? false,
  });
};

const handleSaveEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editForm || !editProduct) return;
  setSaving(true);
  const res = await fetch(`/api/admin/products/${editProduct.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(editForm),
  });
  if (res.ok) {
    const d = await res.json();
    setProducts((prev) => prev.map((p) => p.id === editProduct.id ? d.product : p));
    setEditProduct(null);
    setEditForm(null);
    toast.success("Producto actualizado");
  } else {
    toast.error("Error al guardar el producto");
  }
  setSaving(false);
};

const handleDelete = async () => {
  if (!deleteId) return;
  setDeleting(true);
  const res = await fetch(`/api/admin/products/${deleteId}`, { method: "DELETE" });
  if (res.ok) {
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    toast.success("Producto eliminado");
  } else {
    toast.error("Error al eliminar");
  }
  setDeleteId(null);
  setDeleting(false);
};

const handleCreateCategory = async () => {
  const name = newCatName.trim();
  if (!name) return;
  const res = await fetch("/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (res.ok) {
    const d = await res.json();
    setCategories((prev) => [...prev, d.category]);
    setNewCatName("");
    toast.success(`Categoría "${name}" creada`);
  } else {
    const d = await res.json();
    toast.error(d.error ?? "Error al crear categoría");
  }
};

// 💡 NUEVO: Guardar edición de categoría (con imagen)
const handleSaveCatEdit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!editCatForm) return;
  setSavingCat(true);
  const res = await fetch(`/api/admin/categories/${editCatForm.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: editCatForm.name, image: editCatForm.image }),
  });
  if (res.ok) {
    const d = await res.json();
    setCategories((prev) => prev.map((c) => c.id === editCatForm.id ? d.category : c));
    setEditCatForm(null);
    toast.success("Categoría actualizada");
  } else {
    toast.error("Error al actualizar");
  }
  setSavingCat(false);
};

const handleDeleteCat = async () => {
  if (!deleteCatId) return;
  const res = await fetch(`/api/admin/categories/${deleteCatId}`, { method: "DELETE" });
  if (res.ok) {
    setCategories((prev) => prev.filter((c) => c.id !== deleteCatId));
    setDeleteCatId(null);
    toast.success("Categoría eliminada");
  } else {
    toast.error("Error al eliminar");
  }
};

const handleCreate = async (e: React.FormEvent) => {
  e.preventDefault();
  setCreating(true);
  const res = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(createForm),
  });
  if (res.ok) {
    const d = await res.json();
    setProducts((prev) => [d.product, ...prev]);
    setCreateOpen(false);
    setCreateForm({ name: "", sku: "", price: 0, stock: 0, status: "DRAFT", categoryName: "", description: "", images: [], isFeatured: false });
    toast.success("Producto creado");
  } else {
    toast.error("Error al crear producto");
  }
  setCreating(false);
};

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-black uppercase">PRODUCTOS</h1>
      <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
        <Plus size={14} /> NUEVO PRODUCTO
      </button>
    </div>

    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-noir-gray-2 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCat("all")}
              className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-colors ${filterCat === "all" ? "bg-noir-black text-white border-noir-black" : "border-noir-gray-2 text-noir-gray-4 hover:border-noir-black hover:text-noir-black"}`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(filterCat === cat.name ? "all" : cat.name)}
                className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 border transition-colors ${filterCat === cat.name ? "bg-noir-black text-white border-noir-black" : "border-noir-gray-2 text-noir-gray-4 hover:border-noir-black hover:text-noir-black"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-noir-gray-2 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-noir-gray-4 text-xs">
              <Loader2 size={16} className="animate-spin" /> Cargando productos...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-noir-gray-2 bg-noir-gray">
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">PRODUCTO</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">SKU</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">CATEGORÍA</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">PRECIO</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">STOCK</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ESTADO</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-gray">
                {filtered.map((p) => {
                  const stock = totalStock(p.variants);
                  return (
                    <tr key={p.id} className="hover:bg-noir-gray/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-12 bg-noir-gray flex-shrink-0 overflow-hidden">
                            {p.images[0] ? (
                              <img src={p.images[0].url} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon size={14} className="text-noir-gray-4" />
                              </div>
                            )}
                          </div>
                          <span className="text-sm font-medium line-clamp-2 max-w-[200px] flex items-center gap-2">
                            {p.name}
                            {p.isFeatured && <Star size={12} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-noir-gray-4 font-mono">{p.sku ?? "—"}</td>
                      <td className="p-4 text-xs text-noir-gray-4">{p.category?.name ?? "—"}</td>
                      <td className="p-4 text-sm font-bold">{formatPrice(p.price)}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold ${stock === 0 ? "text-red-600" : stock < 10 ? "text-orange-600" : "text-green-600"}`}>
                          {stock === 0 ? "Sin stock" : `${stock} uds`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          p.status === "ACTIVE" ? "bg-green-50 text-green-700 border border-green-200" :
                          p.status === "DRAFT" ? "bg-gray-50 text-gray-600 border border-gray-200" :
                          "bg-red-50 text-red-700 border border-red-200"
                        }`}>
                          {p.status === "ACTIVE" ? "Activo" : p.status === "DRAFT" ? "Borrador" : "Archivado"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Ver">
                            <Eye size={14} />
                          </button>
                          <button onClick={() => openEdit(p)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar">
                            <Edit size={14} />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors" title="Eliminar">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-noir-gray-4">Sin productos con este filtro</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Categories panel */}
      <div className="w-64 flex-shrink-0">
        <div className="bg-white border border-noir-gray-2">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-noir-gray-2">
            <Tag size={13} className="text-noir-gray-4" />
            <span className="text-[10px] font-black tracking-widest uppercase">CATEGORÍAS</span>
          </div>
          <div className="divide-y divide-noir-gray">
            {categories.map((cat) => (
              <div key={cat.id} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      {/* Muestra miniatura si tiene */}
                      {cat.image && (
                        <img src={cat.image} alt="" className="w-6 h-6 object-cover rounded-sm border border-noir-gray-2" />
                      )}
                      <div>
                        <button
                          onClick={() => setFilterCat(filterCat === cat.name ? "all" : cat.name)}
                          className="text-xs font-bold text-left truncate w-full hover:text-noir-gray-4 transition-colors flex items-center gap-1"
                        >
                          {filterCat === cat.name && <ChevronRight size={10} className="flex-shrink-0" />}
                          {cat.name}
                        </button>
                        <p className="text-[9px] text-noir-gray-4 mt-0.5">{cat._count.products} producto{cat._count.products !== 1 ? "s" : ""} · /{cat.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* 💡 AQUI ABRIMOS EL MODAL DE EDITAR CATEGORÍA */}
                      <button onClick={() => setEditCatForm({ id: cat.id, name: cat.name, image: cat.image || "" })} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar">
                        <Edit size={11} />
                      </button>
                      <button onClick={() => setDeleteCatId(cat.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors" title="Eliminar">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
              </div>
            ))}
            {categories.length === 0 && !loading && (
              <p className="px-4 py-3 text-[10px] text-noir-gray-4">Sin categorías aún.</p>
            )}
          </div>
          <div className="border-t border-noir-gray-2 p-4">
            <p className="text-[9px] font-black tracking-widest uppercase text-noir-gray-4 mb-2">NUEVA CATEGORÍA</p>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
              placeholder="Nombre de la categoría"
              className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors mb-2"
            />
            <button
              onClick={handleCreateCategory}
              className="w-full flex items-center justify-center gap-1.5 bg-noir-black text-white py-2 text-[10px] font-black tracking-widest uppercase hover:bg-black transition-colors"
            >
              <Plus size={11} /> CREAR
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* 💡 MODAL PARA EDITAR CATEGORÍA */}
    {editCatForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setEditCatForm(null)} />
        <div className="relative bg-white w-full max-w-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black uppercase">EDITAR CATEGORÍA</h2>
            <button onClick={() => setEditCatForm(null)} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
          </div>
          <form onSubmit={handleSaveCatEdit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE</label>
              <input required type="text" value={editCatForm.name}
                onChange={(e) => setEditCatForm({ ...editCatForm, name: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            
            <ImageUploader
              single={true}
              images={editCatForm.image ? [editCatForm.image] : []}
              onChange={(urls) => setEditCatForm({ ...editCatForm, image: urls[0] || "" })}
            />

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={savingCat} className="flex-1 flex justify-center items-center gap-2 bg-noir-black text-white px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60">
                {savingCat ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                GUARDAR
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit modal */}
    {editProduct && editForm && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setEditProduct(null)} />
        <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black uppercase">EDITAR PRODUCTO</h2>
            <button onClick={() => setEditProduct(null)} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
          </div>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE</label>
              <input required type="text" value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">SKU</label>
                <input type="text" value={editForm.sku}
                  onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black font-mono transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">CATEGORÍA</label>
                <select value={editForm.categoryName}
                  onChange={(e) => setEditForm({ ...editForm, categoryName: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white">
                  <option value="">— Sin categoría —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">PRECIO (COP)</label>
                <input required type="number" value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">STOCK TOTAL</label>
                <input type="number" value={editForm.stock}
                  onChange={(e) => setEditForm({ ...editForm, stock: Number(e.target.value) })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">ESTADO</label>
                <select value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "ACTIVE" | "DRAFT" | "ARCHIVED" })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white">
                  <option value="ACTIVE">Activo</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">DESTACADO (HOME)</label>
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, isFeatured: !editForm.isFeatured })}
                  className={`flex items-center gap-2 text-xs font-bold uppercase transition-colors px-2 py-2.5 ${editForm.isFeatured ? "text-green-600" : "text-noir-gray-4"}`}
                >
                  {editForm.isFeatured ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  {editForm.isFeatured ? "Sí, Destacar" : "No Destacado"}
                </button>
              </div>
            </div>

            <ImageUploader
              images={editForm.images}
              onChange={(urls) => setEditForm({ ...editForm, images: urls })}
            />
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {saving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
              </button>
              <button type="button" onClick={() => setEditProduct(null)} className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Delete product confirm */}
    {deleteId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setDeleteId(null)} />
        <div className="relative bg-white w-full max-w-sm p-6 text-center">
          <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-black uppercase mb-2">¿ELIMINAR PRODUCTO?</h2>
          <p className="text-xs text-noir-gray-4 mb-6">Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleDelete} disabled={deleting} className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors disabled:opacity-60">
              {deleting ? "..." : "SÍ, ELIMINAR"}
            </button>
            <button onClick={() => setDeleteId(null)} className="border border-noir-gray-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Create product modal */}
    {createOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setCreateOpen(false)} />
        <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-black uppercase">NUEVO PRODUCTO</h2>
            <button onClick={() => setCreateOpen(false)} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE *</label>
              <input required type="text" value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                placeholder="Ej: Noir Oversized Tee"
                className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">SKU</label>
                <input type="text" value={createForm.sku}
                  onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                  placeholder="NL-TSH-001"
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black font-mono transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">CATEGORÍA</label>
                <select value={createForm.categoryName}
                  onChange={(e) => setCreateForm({ ...createForm, categoryName: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white">
                  <option value="">— Sin categoría —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">PRECIO (COP) *</label>
                <input required type="number" min={0} value={createForm.price}
                  onChange={(e) => setCreateForm({ ...createForm, price: Number(e.target.value) })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">STOCK INICIAL</label>
                <input type="number" min={0} value={createForm.stock}
                  onChange={(e) => setCreateForm({ ...createForm, stock: Number(e.target.value) })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">ESTADO</label>
                <select value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as "ACTIVE" | "DRAFT" | "ARCHIVED" })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors bg-white">
                  <option value="DRAFT">Borrador</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="ARCHIVED">Archivado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">DESTACADO (HOME)</label>
                <button
                  type="button"
                  onClick={() => setCreateForm({ ...createForm, isFeatured: !createForm.isFeatured })}
                  className={`flex items-center gap-2 text-xs font-bold uppercase transition-colors px-2 py-2.5 ${createForm.isFeatured ? "text-green-600" : "text-noir-gray-4"}`}
                >
                  {createForm.isFeatured ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  {createForm.isFeatured ? "Sí, Destacar" : "No Destacado"}
                </button>
              </div>
            </div>

            <ImageUploader
              images={createForm.images}
              onChange={(urls) => setCreateForm({ ...createForm, images: urls })}
            />
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={creating}
                className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60">
                {creating ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {creating ? "CREANDO..." : "CREAR PRODUCTO"}
              </button>
              <button type="button" onClick={() => setCreateOpen(false)} className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Delete category confirm */}
    {deleteCatId && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-noir-black/50" onClick={() => setDeleteCatId(null)} />
        <div className="relative bg-white w-full max-w-sm p-6 text-center">
          <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
          <h2 className="text-sm font-black uppercase mb-2">¿ELIMINAR CATEGORÍA?</h2>
          <p className="text-xs text-noir-gray-4 mb-6">
            Se eliminará del menú de navegación y páginas. Los productos quedarán sin categoría.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleDeleteCat} className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors">
              SÍ, ELIMINAR
            </button>
            <button onClick={() => setDeleteCatId(null)} className="border border-noir-gray-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
              CANCELAR
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}