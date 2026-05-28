"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Mail, Send, Clock, Copy, Eye, Zap, Edit, X, Check, Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "SENT" | "DRAFT" | "SCHEDULED" | "CANCELLED";
  segment: string | null;
  html: string;
  scheduledAt: string | null;
  sentCount: number;
  createdAt: string;
}

const automationsDefault = [
  { type: "WELCOME", name: "Bienvenida", desc: "Se envía al registrarse", active: true },
  { type: "ABANDONED_CART", name: "Carrito abandonado", desc: "Después de 1 hora sin comprar", active: true },
  { type: "ORDER_CONFIRMATION", name: "Confirmación de compra", desc: "Inmediato al pagar", active: true },
  { type: "ORDER_SHIPPED", name: "Tracking del pedido", desc: "Al marcar como enviado", active: false },
  { type: "REPURCHASE", name: "Recompra", desc: "30 días sin actividad", active: false },
  { type: "BIRTHDAY_DISCOUNT", name: "Descuento cumpleaños", desc: "El día del cumpleaños", active: false },
];

const STATUS_COLORS: Record<string, string> = {
  SENT: "text-green-700 bg-green-50 border-green-200",
  DRAFT: "text-gray-600 bg-gray-50 border-gray-200",
  SCHEDULED: "text-blue-700 bg-blue-50 border-blue-200",
  CANCELLED: "text-red-700 bg-red-50 border-red-200",
};
const STATUS_LABELS: Record<string, string> = {
  SENT: "Enviado", DRAFT: "Borrador", SCHEDULED: "Programado", CANCELLED: "Cancelado",
};

const BLANK: Omit<Campaign, "id" | "sentCount" | "createdAt"> = {
  name: "", subject: "", status: "DRAFT", segment: "", html: "", scheduledAt: null,
};

type EditorMode = "visual" | "html";

function CampaignEditor({
  title, campaign, onSave, onClose,
}: {
  title: string;
  campaign: Omit<Campaign, "id" | "sentCount" | "createdAt">;
  onSave: (c: Omit<Campaign, "id" | "sentCount" | "createdAt">) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState(campaign);
  const [editorMode, setEditorMode] = useState<EditorMode>("html");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  const handleSendNow = async () => {
    if (!form.subject || !form.html) {
      toast.error("Completa el asunto y el contenido antes de enviar");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          html: form.html,
          segment: form.segment,
          name: form.name,
          testEmail: testEmail || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      toast.success("Campaña enviada correctamente");
      await onSave({ ...form, status: "SENT" });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar la campaña");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-noir-black/50" onClick={onClose} />
      <div className="relative bg-white w-full max-w-3xl max-h-[92vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-noir-gray-2 flex-shrink-0">
          <h2 className="text-sm font-black uppercase">{title}</h2>
          <button onClick={onClose} className="text-noir-gray-4 hover:text-noir-black"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">NOMBRE DE LA CAMPAÑA</label>
              <input required type="text" placeholder="Ej: Lanzamiento colección invierno"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">ASUNTO DEL EMAIL</label>
              <input required type="text" placeholder="Ej: ¡La nueva colección llegó! 🖤"
                value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">SEGMENTO DE CLIENTES</label>
              <select value={form.segment ?? ""} onChange={(e) => setForm({ ...form, segment: e.target.value })}
                className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white">
                <option value="">Todos los clientes</option>
                <option value="new">Clientes nuevos</option>
                <option value="vip">Clientes VIP</option>
                <option value="frequent">Clientes frecuentes</option>
                <option value="inactive">Clientes inactivos (+30 días)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">CONTENIDO DEL EMAIL</label>
              <div className="flex gap-1 mb-3">
                {([
                  { key: "html", label: "Código HTML" },
                  { key: "visual", label: "Editor visual" },
                ] as { key: EditorMode; label: string }[]).map((m) => (
                  <button key={m.key} type="button"
                    onClick={() => setEditorMode(m.key)}
                    className={`px-3 py-1.5 text-xs font-bold border transition-colors ${editorMode === m.key ? "border-noir-black bg-noir-black text-white" : "border-noir-gray-2 hover:border-noir-black"}`}>
                    {m.label}
                  </button>
                ))}
                <button type="button" onClick={() => setPreview(!preview)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-noir-gray-2 hover:border-noir-black transition-colors">
                  <Eye size={12} /> {preview ? "Editar" : "Vista previa"}
                </button>
              </div>

              {editorMode === "visual" && !preview && (
                <div className="border border-noir-gray-2 p-4 space-y-3 bg-white min-h-[200px]">
                  <p className="text-[10px] text-noir-gray-4 uppercase tracking-widest font-bold mb-2">Bloques de contenido</p>
                  {[
                    { label: "Título principal", ph: "Ej: Nueva colección llegó 🖤" },
                    { label: "Párrafo de texto", ph: "Escribe el cuerpo del email..." },
                    { label: "URL de imagen de cabecera", ph: "https://..." },
                    { label: "Texto del botón CTA", ph: "VER COLECCIÓN" },
                    { label: "URL del botón CTA", ph: "/tienda" },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[10px] text-noir-gray-4 mb-1">{f.label}</label>
                      <input type="text" placeholder={f.ph}
                        className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
                    </div>
                  ))}
                </div>
              )}

              {editorMode === "html" && !preview && (
                <textarea rows={12}
                  placeholder="Pega aquí tu código HTML o escribe el contenido del email..."
                  value={form.html}
                  onChange={(e) => setForm({ ...form, html: e.target.value })}
                  className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors font-mono resize-y" />
              )}

              {preview && (
                <div className="border border-noir-gray-2 overflow-hidden">
                  <div className="bg-noir-gray px-4 py-2 border-b border-noir-gray-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Vista previa</span>
                    <span className="text-[10px] text-noir-gray-4">Asunto: {form.subject || "—"}</span>
                  </div>
                  <div className="p-4 bg-white min-h-[200px]">
                    {form.html ? (
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.html }} />
                    ) : (
                      <p className="text-xs text-noir-gray-4 text-center mt-8">Sin contenido aún</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">PROGRAMAR ENVÍO (OPCIONAL)</label>
              <input type="datetime-local" value={form.scheduledAt ?? ""}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value || null })}
                className="border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
          </div>

          <div className="px-6 pb-2 pt-4 border-t border-noir-gray-2">
            <p className="text-[10px] font-bold tracking-widest uppercase mb-2 text-noir-gray-4">ENVÍO DE PRUEBA (opcional)</p>
            <div className="flex gap-2 items-center">
              <input
                type="email"
                placeholder="correo@destino.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors"
              />
              <p className="text-[10px] text-noir-gray-4 max-w-[200px] leading-tight">
                Si lo dejas vacío, se envía al segmento configurado.
              </p>
            </div>
          </div>

          <div className="flex gap-3 px-6 pb-6 pt-3 flex-shrink-0 flex-wrap">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-noir-black text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              {saving ? "GUARDANDO..." : "GUARDAR"}
            </button>
            <button type="button" onClick={handleSendNow} disabled={sending}
              className="flex items-center gap-2 border border-noir-gray-2 px-5 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {sending ? "ENVIANDO..." : "ENVIAR AHORA"}
            </button>
            <button type="button"
              onClick={async () => {
                if (!form.scheduledAt) { toast.error("Selecciona una fecha/hora de programación"); return; }
                await onSave({ ...form, status: "SCHEDULED" });
                toast.success(`Campaña programada para ${new Date(form.scheduledAt).toLocaleString("es-CO")}`);
              }}
              className="flex items-center gap-2 border border-noir-gray-2 px-5 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
              <Clock size={13} /> PROGRAMAR
            </button>
            <button type="button" onClick={onClose} className="ml-auto border border-noir-gray-2 px-5 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const [tab, setTab] = useState<"campaigns" | "automations">("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAutomations, setActiveAutomations] = useState<Record<string, boolean>>(
    Object.fromEntries(automationsDefault.map((a) => [a.type, a.active]))
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorTarget, setEditorTarget] = useState<Campaign | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/campaigns");
    if (res.ok) {
      const d = await res.json();
      const mapped = d.campaigns.map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name,
        subject: c.subject,
        status: c.status,
        segment: c.segment ?? "",
        html: c.htmlContent ?? "",
        scheduledAt: c.scheduledAt ? new Date(c.scheduledAt as string).toISOString().slice(0, 16) : null,
        sentCount: c.sentCount ?? 0,
        createdAt: new Date(c.createdAt as string).toISOString().slice(0, 10),
      }));
      setCampaigns(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const openNew = () => { setEditorTarget(null); setEditorOpen(true); };
  const openEdit = (c: Campaign) => { setEditorTarget(c); setEditorOpen(true); };

  const handleSave = async (form: Omit<Campaign, "id" | "sentCount" | "createdAt">) => {
    if (editorTarget) {
      const res = await fetch(`/api/admin/campaigns/${editorTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, subject: form.subject, html: form.html, status: form.status, segment: form.segment, scheduledAt: form.scheduledAt }),
      });
      if (res.ok) {
        await loadCampaigns();
        toast.success("Campaña actualizada");
      } else {
        toast.error("Error al actualizar campaña");
      }
    } else {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, subject: form.subject, html: form.html, status: form.status, segment: form.segment, scheduledAt: form.scheduledAt }),
      });
      if (res.ok) {
        await loadCampaigns();
        toast.success("Campaña creada");
      } else {
        toast.error("Error al crear campaña");
      }
    }
    setEditorOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/campaigns/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteId));
      toast.success("Campaña eliminada");
    } else {
      toast.error("Error al eliminar");
    }
    setDeleteId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black uppercase">MARKETING</h1>
        <button onClick={openNew}
          className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          <Plus size={14} /> NUEVA CAMPAÑA
        </button>
      </div>

      <div className="flex gap-1 mb-6 border-b border-noir-gray-2">
        {[
          { key: "campaigns", label: "Campañas", icon: <Mail size={14} /> },
          { key: "automations", label: "Automatizaciones", icon: <Zap size={14} /> },
        ].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors ${
              tab === t.key ? "border-noir-black text-noir-black" : "border-transparent text-noir-gray-4 hover:text-noir-black"
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "campaigns" && (
        <div className="bg-white border border-noir-gray-2">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-noir-gray-4 text-xs">
              <Loader2 size={16} className="animate-spin" /> Cargando campañas...
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-noir-gray-2 bg-noir-gray">
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">CAMPAÑA</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ASUNTO</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ESTADO</th>
                  <th className="text-left text-[10px] font-bold tracking-widest uppercase p-4">ENVIADOS</th>
                  <th className="p-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-gray">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-xs text-noir-gray-4">
                      No hay campañas aún. Crea la primera.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="hover:bg-noir-gray/30 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-noir-gray-4">{c.createdAt}</p>
                      </td>
                      <td className="p-4 text-sm text-noir-gray-4">{c.subject}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[c.status]}`}>
                          {STATUS_LABELS[c.status]}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{c.sentCount.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(c)} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Editar"><Edit size={14} /></button>
                          <button onClick={() => {
                            const copy = { ...c };
                            handleSave({ name: `${copy.name} (copia)`, subject: copy.subject, status: "DRAFT", segment: copy.segment, html: copy.html, scheduledAt: null });
                          }} className="text-noir-gray-4 hover:text-noir-black transition-colors" title="Duplicar"><Copy size={14} /></button>
                          <button onClick={() => setDeleteId(c.id)} className="text-noir-gray-4 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "automations" && (
        <div className="bg-white border border-noir-gray-2 divide-y divide-noir-gray">
          {automationsDefault.map((a) => (
            <div key={a.type} className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <Zap size={16} className={activeAutomations[a.type] ? "text-green-500" : "text-noir-gray-4"} />
                <div>
                  <p className="text-sm font-bold">{a.name}</p>
                  <p className="text-xs text-noir-gray-4">{a.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveAutomations((prev) => ({ ...prev, [a.type]: !prev[a.type] }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${activeAutomations[a.type] ? "bg-green-500" : "bg-noir-gray-3"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${activeAutomations[a.type] ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      )}

      {editorOpen && (
        <CampaignEditor
          title={editorTarget ? "EDITAR CAMPAÑA" : "NUEVA CAMPAÑA"}
          campaign={editorTarget
            ? { name: editorTarget.name, subject: editorTarget.subject, status: editorTarget.status, segment: editorTarget.segment, html: editorTarget.html, scheduledAt: editorTarget.scheduledAt }
            : BLANK
          }
          onSave={handleSave}
          onClose={() => setEditorOpen(false)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white w-full max-w-sm p-6 text-center">
            <AlertTriangle size={32} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-sm font-black uppercase mb-2">¿ELIMINAR CAMPAÑA?</h2>
            <p className="text-xs text-noir-gray-4 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors">SÍ, ELIMINAR</button>
              <button onClick={() => setDeleteId(null)} className="border border-noir-gray-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">CANCELAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
