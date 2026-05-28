"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AnnouncementItem {
  id: string;
  text: string;
  link: string | null;
  isActive: boolean;
  order: number;
}

const BLANK = { text: "", link: "" };

export default function ContenidoPage() {
  const [tab, setTab] = useState<"announcements" | "looks">("announcements");

  // ── Announcements state ──────────────────────────────────────────────────
  const [items, setItems] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/announcements");
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setItems(data);
    } catch {
      toast.error("No se pudieron cargar los anuncios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const openCreate = () => {
    setEditId(null);
    setForm(BLANK);
    setShowForm(true);
  };

  const openEdit = (item: AnnouncementItem) => {
    setEditId(item.id);
    setForm({ text: item.text, link: item.link || "" });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.text.trim()) { toast.error("El texto es requerido"); return; }
    setSaving(true);
    try {
      if (editId) {
        const res = await fetch(`/api/admin/announcements/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: form.text.trim(), link: form.link || null }),
        });
        if (!res.ok) throw new Error();
        toast.success("Anuncio actualizado");
      } else {
        const res = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: form.text.trim(), link: form.link || null, isActive: true, order: items.length }),
        });
        if (!res.ok) throw new Error();
        toast.success("Anuncio creado");
      }
      setShowForm(false);
      setEditId(null);
      setForm(BLANK);
      loadAnnouncements();
    } catch {
      toast.error("Error al guardar anuncio");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: AnnouncementItem) => {
    setTogglingId(item.id);
    try {
      const res = await fetch(`/api/admin/announcements/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(item.isActive ? "Anuncio desactivado" : "Anuncio activado");
      loadAnnouncements();
    } catch {
      toast.error("Error al actualizar estado");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeletingId(deleteId);
    try {
      const res = await fetch(`/api/admin/announcements/${deleteId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Anuncio eliminado");
      setDeleteId(null);
      loadAnnouncements();
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">CONTENIDO (CMS)</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-noir-gray-2">
        {[
          { key: "announcements", label: "Barra de anuncios" },
          { key: "looks", label: "Total Looks" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors ${
              tab === t.key ? "border-noir-black text-noir-black" : "border-transparent text-noir-gray-4 hover:text-noir-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ANNOUNCEMENTS TAB ── */}
      {tab === "announcements" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs text-noir-gray-4">
              Los anuncios activos rotan en la barra superior del sitio.
            </p>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors"
            >
              <Plus size={14} /> AGREGAR ANUNCIO
            </button>
          </div>

          {/* Form modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-black uppercase text-sm tracking-widest">
                    {editId ? "Editar anuncio" : "Nuevo anuncio"}
                  </h2>
                  <button onClick={() => setShowForm(false)} className="text-noir-gray-4 hover:text-noir-black">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-noir-gray-4 block mb-1">Texto *</label>
                    <input
                      className="w-full border border-noir-gray-2 px-3 py-2 text-sm focus:outline-none focus:border-noir-black"
                      placeholder="ENVÍOS GRATIS DESDE $250.000"
                      value={form.text}
                      onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-noir-gray-4 block mb-1">Link (opcional)</label>
                    <input
                      className="w-full border border-noir-gray-2 px-3 py-2 text-sm focus:outline-none focus:border-noir-black"
                      placeholder="/tienda"
                      value={form.link}
                      onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-5">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 border border-noir-gray-2 py-2 text-xs font-bold uppercase tracking-widest hover:bg-noir-gray transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-noir-black text-white py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {editId ? "Guardar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete confirm */}
          {deleteId && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm p-6 text-center">
                <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
                <p className="font-bold mb-1">¿Eliminar este anuncio?</p>
                <p className="text-xs text-noir-gray-4 mb-5">Esta acción no se puede deshacer.</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeleteId(null)} className="flex-1 border border-noir-gray-2 py-2 text-xs font-bold uppercase tracking-widest">Cancelar</button>
                  <button
                    onClick={handleDelete}
                    disabled={!!deletingId}
                    className="flex-1 bg-red-600 text-white py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deletingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-noir-gray-4" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-noir-gray-2 p-8 text-center text-noir-gray-4 text-sm">
              No hay anuncios. Crea el primero.
            </div>
          ) : (
            <div className="bg-white border border-noir-gray-2 divide-y divide-noir-gray">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xs font-bold text-noir-gray-4 w-4 shrink-0">{item.order + 1}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.text}</p>
                      {item.link && <p className="text-xs text-noir-gray-4">{item.link}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4 shrink-0">
                    <button
                      onClick={() => toggleActive(item)}
                      disabled={togglingId === item.id}
                      className={`text-xs font-bold px-2 py-0.5 rounded border transition-colors disabled:opacity-50 ${
                        item.isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      {togglingId === item.id ? <Loader2 size={10} className="animate-spin inline" /> : (item.isActive ? "Activo" : "Inactivo")}
                    </button>
                    <button onClick={() => openEdit(item)} className="text-noir-gray-4 hover:text-noir-black transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => setDeleteId(item.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LOOKS TAB ── */}
      {tab === "looks" && (
        <div>
          <div className="flex justify-end mb-4">
            <button className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
              <Plus size={14} /> NUEVO LOOK
            </button>
          </div>
          <div className="bg-white border border-noir-gray-2 p-8 text-center text-noir-gray-4 text-sm">
            No hay Total Looks creados aún.
          </div>
        </div>
      )}
    </div>
  );
}
