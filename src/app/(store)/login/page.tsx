"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("✅ Correo confirmado. ¡Ya puedes iniciar sesión! Revisa tu bandeja para el cupón de bienvenida.");
    } else if (searchParams.get("registered") === "1") {
      toast.info("📧 Revisa tu correo y confirma tu email para activar la cuenta.");
    } else if (searchParams.get("error") === "token_expired") {
      toast.error("El enlace de verificación expiró. Regístrate de nuevo.");
    } else if (searchParams.get("error")) {
      toast.error("Enlace inválido. Por favor regístrate de nuevo.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión");
      toast.success("¡Bienvenido de nuevo!");
      const redirect = searchParams.get("redirect") || "/cuenta";
      window.location.href = redirect;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-noir-gray px-4">
        <div className="w-full max-w-md bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-xl font-black tracking-[0.15em] uppercase mb-1">
              NOIR
              <span className="inline-block w-3 h-3 mx-1 rounded-full border-2 border-noir-black align-middle" />
              LOVERS
            </div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-noir-gold">
              MI CUENTA
            </p>
            <div className="w-16 h-px bg-gradient-to-r from-transparent via-noir-gold to-transparent mx-auto mt-2" />
          </div>

          <h2 className="text-lg font-black mb-1">Iniciar sesión</h2>
          <p className="text-xs text-noir-gray-4 mb-6">Accede a tu cuenta para gestionar pedidos</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                CORREO ELECTRÓNICO
              </label>
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
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">
                CONTRASEÑA
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full border border-noir-gray-2 pl-9 pr-10 py-3 text-sm outline-none focus:border-noir-black transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-4"
                >
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
                "INICIAR SESIÓN"
              )}
            </button>
          </form>

          <Link
            href="/recuperar-contrasena"
            className="block text-center text-xs text-noir-gray-4 hover:text-noir-black transition-colors mt-4"
          >
            ¿Olvidaste tu contraseña?
          </Link>

          <div className="mt-8 pt-6 border-t border-noir-gray-2 text-center">
            <p className="text-xs text-noir-gray-4 mb-4">¿No tienes cuenta?</p>
            <Link
              href="/registro"
              className="inline-block border border-noir-black px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-noir-black hover:text-white transition-colors"
            >
              CREAR CUENTA
            </Link>
          </div>
        </div>
      </div>
  );
}

import { Suspense } from "react";
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><span className="w-6 h-6 border-2 border-noir-gray-2 border-t-noir-black rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
