"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Lock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function RestablecerForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { if (!token) router.replace("/login"); }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; }
    if (password.length < 8) { toast.error("Mínimo 8 caracteres"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
      toast.success("Contraseña actualizada correctamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al restablecer");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-noir-gray px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 border border-noir-gray-2">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-1">NOIR LOVERS</p>
          <h1 className="text-2xl font-black uppercase tracking-tight">Nueva contraseña</h1>
        </div>
        {done ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-noir-gray-4">Tu contraseña fue actualizada correctamente.</p>
            <Link href="/login" className="block w-full bg-noir-black text-white py-3 text-xs font-bold tracking-widest uppercase text-center hover:bg-black transition-colors">
              INICIAR SESIÓN
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">NUEVA CONTRASEÑA</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full border border-noir-gray-2 pl-9 pr-10 py-3 text-sm outline-none focus:border-noir-black transition-colors" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-4">
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">CONFIRMAR CONTRASEÑA</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-noir-gray-4" />
                <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required
                  className="w-full border border-noir-gray-2 pl-9 pr-4 py-3 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-noir-black text-white py-4 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "GUARDAR CONTRASEÑA"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
