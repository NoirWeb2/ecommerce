"use client";

import { useState } from "react";
import { MapPin, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { toast } from "sonner";
import CityAutocomplete from "@/components/ui/CityAutocomplete";

interface Address {
  id: string;
  alias: string;
  fullName: string;
  line1: string;
  city: string;
  department: string;
  phone: string;
  isDefault: boolean;
}

const BLANK: Omit<Address, "id" | "isDefault"> = {
  alias: "",
  fullName: "",
  line1: "",
  city: "",
  department: "",
  phone: "",
};

export default function DireccionesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(BLANK);

  const openAdd = () => {
    setEditId(null);
    setForm(BLANK);
    setShowModal(true);
  };

  const openEdit = (addr: Address) => {
    setEditId(addr.id);
    setForm({
      alias: addr.alias,
      fullName: addr.fullName,
      line1: addr.line1,
      city: addr.city,
      department: addr.department,
      phone: addr.phone,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast.success("Dirección eliminada");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editId ? { ...a, ...form } : a))
      );
      toast.success("Dirección actualizada");
    } else {
      setAddresses((prev) => [
        ...prev,
        { id: Date.now().toString(), ...form, isDefault: prev.length === 0 },
      ]);
      toast.success("Dirección agregada");
    }
    setShowModal(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase">DIRECCIONES</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors"
        >
          <Plus size={14} /> AGREGAR
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white p-12 text-center">
          <MapPin size={40} className="text-noir-gray-3 mx-auto mb-4" />
          <p className="text-sm text-noir-gray-4 mb-4">No tienes direcciones guardadas.</p>
          <button
            onClick={openAdd}
            className="text-xs font-bold tracking-widest uppercase underline underline-offset-4"
          >
            AGREGAR PRIMERA DIRECCIÓN
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="bg-white border border-noir-gray-2 p-5 relative">
              {addr.isDefault && (
                <span className="text-[9px] font-bold tracking-widest uppercase bg-noir-black text-white px-2 py-0.5 absolute top-4 right-4">
                  PRINCIPAL
                </span>
              )}
              <p className="text-xs font-bold tracking-widest uppercase mb-2">{addr.alias || "Dirección"}</p>
              <p className="text-sm font-medium">{addr.fullName}</p>
              <p className="text-sm text-noir-gray-4">{addr.line1}</p>
              <p className="text-sm text-noir-gray-4">
                {addr.city}, {addr.department}
              </p>
              <p className="text-sm text-noir-gray-4">{addr.phone}</p>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-noir-gray">
                <button
                  onClick={() => openEdit(addr)}
                  className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase hover:text-noir-black transition-colors text-noir-gray-4"
                >
                  <Edit2 size={12} /> EDITAR
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase hover:text-red-600 transition-colors text-noir-gray-4"
                >
                  <Trash2 size={12} /> ELIMINAR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-black uppercase">
                {editId ? "EDITAR DIRECCIÓN" : "NUEVA DIRECCIÓN"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-noir-gray-4 hover:text-noir-black">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                  ETIQUETA (Casa, Trabajo…)
                </label>
                <input
                  type="text"
                  placeholder="Casa"
                  value={form.alias}
                  onChange={(e) => setForm({ ...form, alias: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                  NOMBRE COMPLETO
                </label>
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                  DIRECCIÓN
                </label>
                <input
                  required
                  type="text"
                  placeholder="Calle 26 # 5-10, Apto 302"
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                  CIUDAD
                </label>
                <CityAutocomplete
                  value={form.city}
                  onChange={(ciudad, departamento) =>
                    setForm({ ...form, city: ciudad, department: departamento || form.department })
                  }
                  placeholder="Bogotá"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                  TELÉFONO DE CONTACTO
                </label>
                <input
                  type="tel"
                  placeholder="+57 300 000 0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-noir-black text-white px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors"
                >
                  <Check size={13} /> GUARDAR
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="border border-noir-gray-2 px-6 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors"
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
