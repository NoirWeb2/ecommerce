"use client";

import { Metadata } from "next";
import { Mail, Phone, Instagram, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const contactInfo = [
  { icon: <Mail size={16} />, label: "hola@noirlovers.com", href: "mailto:hola@noirlovers.com" },
  { icon: <Phone size={16} />, label: "+57 300 000 0000", href: "tel:+573000000000" },
  { icon: <Instagram size={16} />, label: "@noirlovers", href: "https://instagram.com/noirlovers" },
  { icon: <MapPin size={16} />, label: "Bogotá, Colombia", href: null },
];

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      toast.success("Mensaje enviado. Te respondemos en menos de 24 horas.");
      setForm({ nombre: "", email: "", mensaje: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar el mensaje");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-16">
      {/* Left */}
      <div>
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
          HOLA, ESTAMOS AQUÍ.
        </h1>
        <p className="text-noir-gray-4 text-sm mt-4 leading-relaxed max-w-md">
          Tienes dudas sobre tallas, pedidos, devoluciones o simplemente quieres hablar de moda oscura — escríbenos. Respondemos en menos de 24 horas.
        </p>

        <ul className="mt-10 space-y-5">
          {contactInfo.map((item) => (
            <li key={item.label} className="flex items-center gap-3">
              <span className="text-noir-gray-4">{item.icon}</span>
              {item.href ? (
                <a href={item.href} className="text-sm font-medium hover:underline underline-offset-2">
                  {item.label}
                </a>
              ) : (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-10 p-6 bg-noir-gray rounded">
          <p className="text-xs font-bold tracking-widest uppercase mb-2">HORARIO DE ATENCIÓN</p>
          <p className="text-sm text-noir-gray-4">Lunes a viernes, 9am — 6pm (hora Colombia)</p>
        </div>
      </div>

      {/* Right — Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase mb-2">NOMBRE</label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase mb-2">EMAIL</label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold tracking-widest uppercase mb-2">MENSAJE</label>
          <textarea
            placeholder="¿En qué podemos ayudarte?"
            rows={6}
            value={form.mensaje}
            onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
            required
            className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-noir-black text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send size={14} />
              ENVIAR MENSAJE
            </>
          )}
        </button>
      </form>
    </div>
  );
}
