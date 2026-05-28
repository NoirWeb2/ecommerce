"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear cuenta");
      toast.success("¡Cuenta creada! Revisa tu correo para confirmar tu email.");
      router.push("/login?registered=1");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al crear cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-noir-gray px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 shadow-sm">
          <div className="text-center mb-8">
            <div className="text-xl font-black tracking-[0.15em] uppercase mb-1">
              NOIR
              <span className="inline-block w-3 h-3 mx-1 rounded-full border-2 border-noir-black align-middle" />
              LOVERS
            </div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-noir-gold">
              CREAR CUENTA
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-noir-gold to-transparent mx-auto mt-2" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                  <input
                    type="text"
                    placeholder="Juan"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    required
                    className="w-full border border-noir-gray-2 pl-9 pr-3 py-3 text-sm outline-none focus:border-noir-black transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">APELLIDO</label>
                <input
                  type="text"
                  placeholder="García"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                  className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full border border-noir-gray-2 pl-9 pr-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">CONTRASEÑA</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full border border-noir-gray-2 pl-9 pr-10 py-3 text-sm outline-none focus:border-noir-black transition-colors"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-4">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-noir-black text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "CREAR CUENTA"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-noir-gray-2 text-center">
            <p className="text-xs text-noir-gray-4">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-bold underline underline-offset-2 text-noir-black">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}
