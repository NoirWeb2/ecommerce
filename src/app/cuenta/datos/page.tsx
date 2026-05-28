"use client";

import { useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

// In a real app these come from the auth store / API.
// Using dev user data as default.
const INITIAL = {
  firstName: "Cliente",
  lastName: "Demo",
  email: "cliente@noirlovers.com",
  phone: "+57 300 000 0000",
  city: "Bogotá, Colombia",
};

export default function DatosPage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(INITIAL);
  const [form, setForm] = useState(INITIAL);

  const handleEdit = () => {
    setForm(saved);
    setEditing(true);
  };

  const handleCancel = () => {
    setForm(saved);
    setEditing(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(form);
    setEditing(false);
    toast.success("Datos actualizados correctamente");
  };

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
              { label: "NOMBRE", value: `${saved.firstName} ${saved.lastName}` },
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
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
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
                className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors"
              >
                <Check size={13} /> GUARDAR CAMBIOS
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors"
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
