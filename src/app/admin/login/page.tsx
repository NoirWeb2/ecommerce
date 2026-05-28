"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

function ForgotModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, isAdmin: true }),
      });
      setSent(true);
    } catch { toast.error("Error al enviar"); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-[#0a0a0a] border border-white/10 p-8 w-full max-w-sm">
        <h3 className="text-white font-black text-base uppercase tracking-widest mb-1">Recuperar contraseña</h3>
        <p className="text-white/40 text-xs mb-6">Te enviaremos un enlace de restablecimiento.</p>
        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-white/70 text-sm">Revisa tu correo. Si está registrado, recibirás el enlace en breve.</p>
            <button onClick={onClose} className="w-full bg-[#C9A84C] text-black py-3 text-xs font-black tracking-widest uppercase">CERRAR</button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@noirlovers.com"
                className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 border border-white/10 text-white/40 py-3 text-xs font-bold tracking-widest uppercase hover:border-white/30 transition-colors">CANCELAR</button>
              <button type="submit" disabled={loading} className="flex-1 bg-[#C9A84C] text-black py-3 text-xs font-black tracking-widest uppercase disabled:opacity-50">
                {loading ? "..." : "ENVIAR"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, adminOnly: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Credenciales inválidas");
      if (!["ADMIN", "SUPER_ADMIN"].includes(data.user?.role)) {
        throw new Error("Sin permisos de administrador");
      }
      toast.success("Acceso concedido");
      window.location.href = "/admin";
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error de acceso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}

      <div className="bg-[#0a0a0a] border-b border-white/10 py-2 overflow-hidden">
        <div className="marquee-wrapper">
          <div className="marquee-content">
            {Array(8).fill(0).map((_, i) => (
              <span key={i} className="text-xs font-medium tracking-widest uppercase mx-8 text-white/60">
                ENVÍOS GRATIS DESDE $250.000
                <span className="mx-4 opacity-30">·</span>
                UNIQUE VIBES BLACK COLLECTIONS
                <span className="mx-4 opacity-30">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border-b border-white/10 py-4 text-center">
        <span className="text-white text-2xl font-black tracking-[0.15em] uppercase">
          NOIR
          <span className="inline-block w-4 h-4 mx-1 rounded-full border-2 border-white align-middle" />
          LOVERS
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="text-lg font-black tracking-[0.15em] uppercase text-white mb-1">
              NOIR
              <span className="inline-block w-3 h-3 mx-1 rounded-full border border-white align-middle" />
              LOVERS
            </div>
            <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C]">
              PANEL ADMINISTRATIVO
            </p>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto mt-2" />
          </div>

          <h2 className="text-white text-lg font-black mb-1">Bienvenido</h2>
          <p className="text-white/40 text-xs mb-6">Ingrese tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-white/60">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" placeholder="admin@noirlovers.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/30 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-white/60">CONTRASEÑA</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? "text" : "password"} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  className="w-full bg-white/5 border border-white/10 pl-9 pr-10 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#C9A84C] text-[#0a0a0a] py-4 text-xs font-black tracking-widest uppercase hover:bg-[#d4b05a] transition-colors disabled:opacity-50 flex items-center justify-center mt-2">
              {loading ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : "INGRESAR AL PANEL"}
            </button>
          </form>

          <button onClick={() => setShowForgot(true)}
            className="block text-center text-xs text-white/30 hover:text-white/60 transition-colors mt-4 w-full">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>

      <p className="text-white/20 text-xs text-center py-4">NOIR LOVERS © {new Date().getFullYear()}</p>
    </div>
  );
}
