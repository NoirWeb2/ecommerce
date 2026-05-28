"use client";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Error al enviar");
      setSent(true);
    } catch {
      toast.error("No se pudo enviar el correo. Inténtalo de nuevo.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-noir-gray px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 border border-noir-gray-2">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-1">NOIR LOVERS</p>
          <h1 className="text-2xl font-black uppercase tracking-tight">Recuperar contraseña</h1>
          <p className="text-sm text-noir-gray-4 mt-2">Te enviamos un enlace para crear una nueva contraseña.</p>
        </div>
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto">
              <Mail size={20} className="text-green-600" />
            </div>
            <p className="text-sm font-medium">Revisa tu correo</p>
            <p className="text-xs text-noir-gray-4">Si el email está registrado, recibirás un enlace en los próximos minutos. Revisa también tu carpeta de spam.</p>
            <Link href="/login" className="block text-xs text-noir-gray-4 hover:text-noir-black transition-colors underline underline-offset-4 mt-4">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="tu@email.com"
                  className="w-full border border-noir-gray-2 pl-9 pr-4 py-3 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-noir-black text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "ENVIAR ENLACE"}
            </button>
            <Link href="/login" className="block text-center text-xs text-noir-gray-4 hover:text-noir-black transition-colors">
              ← Volver al inicio de sesión
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
