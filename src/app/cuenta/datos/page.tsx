"use client";

import { useState, useEffect } from "react";
import { Edit2, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";

export default function DatosPage() {
// Traemos el usuario real que está logueado
const { user } = useAuthStore();

const [editing, setEditing] = useState(false);
const [loading, setLoading] = useState(false);

// Guardamos el estado inicial en base al usuario real (o vacío si aún no carga)
const [saved, setSaved] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
});
const [form, setForm] = useState(saved);

// Cuando el usuario carga desde el store, actualizamos los datos visuales
useEffect(() => {
  if (user) {
    // 💡 FIX DE TYPESCRIPT: Le decimos que no revise los tipos estrictos aquí
    const u = user as any; 
    
    const userData = {
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email || "",
      phone: u.phone || "",
      // Extraemos ciudad si existe de la primera dirección (o lo dejamos en blanco si no hay)
      city: u.addresses?.[0]?.city || "",
    };
    setSaved(userData);
    setForm(userData);
  }
}, [user]);

const handleEdit = () => {
  setForm(saved);
  setEditing(true);
};

const handleCancel = () => {
  setForm(saved);
  setEditing(false);
};

const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // LLAMADA A LA API PARA GUARDAR EN LA BD
    const res = await fetch("/api/auth/update-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) throw new Error("Error al actualizar");

    setSaved(form);
    setEditing(false);
    toast.success("Datos actualizados correctamente");
  } catch (error) {
    toast.error("Hubo un error al guardar tus datos.");
    console.error(error);
  } finally {
    setLoading(false);
  }
};

// Si no hay usuario cargado aún, mostramos un pequeño loading
if (!user) {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="animate-spin text-noir-gray-4" size={24} />
    </div>
  );
}

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-black uppercase">TUS DATOS</h1>
      {!editing && (
        <button
          onClick={handleEdit}
          className="flex items-center gap-2 border border-noir-black text-noir-black px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-noir-black hover:text-white transition-colors"
        >
          <Edit2 size={13} /> EDITAR
        </button>
      )}
    </div>

    <div className="bg-white p-6">
      {/* View mode */}
      {!editing && (
        <dl className="space-y-5 max-w-lg">
          {[
            { label: "NOMBRE", value: `${saved.firstName} ${saved.lastName}`.trim() || "—" },
            { label: "EMAIL", value: saved.email },
            { label: "TELÉFONO", value: saved.phone || "—" },
            { label: "CIUDAD", value: saved.city || "—" },
          ].map((row) => (
            <div key={row.label} className="border-b border-noir-gray pb-4 last:border-0 last:pb-0">
              <dt className="text-[10px] font-bold tracking-widest uppercase text-noir-gray-4 mb-1">
                {row.label}
              </dt>
              <dd className="text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Edit mode */}
      {editing && (
        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                NOMBRE
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                APELLIDO
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
              EMAIL
            </label>
            {/* OJO: El email se deshabilita porque cambiarlo requiere re-verificación */}
            <input
              type="email"
              value={form.email}
              disabled
              className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none bg-gray-50 text-gray-500 cursor-not-allowed transition-colors"
              title="El correo no se puede cambiar"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
              TELÉFONO
            </label>
            <input
              type="tel"
              placeholder="+57 300 000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
              CIUDAD
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} 
              {loading ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleCancel}
              className="flex items-center gap-2 border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors disabled:opacity-60"
            >
              <X size={13} /> CANCELAR
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
);
}