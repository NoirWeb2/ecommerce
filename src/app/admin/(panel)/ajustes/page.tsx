"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

interface FieldDef {
  label: string;
  key: string;
  type: string;
  placeholder?: string;
  secret?: boolean;
}

interface SectionDef {
  title: string;
  section: string;
  description?: string;
  fields: FieldDef[];
}

const SECTIONS_DEF: SectionDef[] = [
  {
    title: "General",
    section: "general",
    fields: [
      { label: "Nombre de la tienda", key: "storeName", type: "text" },
      { label: "Email de contacto", key: "contactEmail", type: "email" },
      { label: "Teléfono", key: "phone", type: "text" },
      { label: "Ciudad", key: "city", type: "text" },
    ],
  },
  {
    title: "Envíos",
    section: "shipping",
    fields: [
      { label: "Costo de envío estándar (COP)", key: "shippingCost", type: "number" },
      { label: "Mínimo para envío gratis (COP)", key: "freeShippingMin", type: "number" },
      { label: "Días de entrega estimados", key: "deliveryDays", type: "text" },
    ],
  },
  {
    title: "Wompi",
    section: "wompi",
    description: "Pasarela de pagos colombiana. Crea tu cuenta en wompi.co.",
    fields: [
      { label: "Public Key", key: "publicKey", type: "text", placeholder: "pub_test_..." },
      { label: "Private Key", key: "privateKey", type: "text", placeholder: "prv_test_...", secret: true },
      { label: "Events Secret", key: "eventsSecret", type: "text", placeholder: "test_events_...", secret: true },
      { label: "Ambiente", key: "env", type: "text", placeholder: "sandbox / production" },
    ],
  },
  {
    title: "MercadoPago",
    section: "mercadopago",
    description: "Para pagos con PSE, Nequi y tarjetas.",
    fields: [
      { label: "Public Key", key: "publicKey", type: "text", placeholder: "TEST-..." },
      { label: "Access Token", key: "accessToken", type: "text", placeholder: "TEST-...", secret: true },
    ],
  },
  {
    title: "Stripe",
    section: "stripe",
    description: "Para pagos internacionales con tarjeta.",
    fields: [
      { label: "Publishable Key", key: "publishableKey", type: "text", placeholder: "pk_live_..." },
      { label: "Secret Key", key: "secretKey", type: "text", placeholder: "sk_live_...", secret: true },
      { label: "Webhook Secret", key: "webhookSecret", type: "text", placeholder: "whsec_...", secret: true },
    ],
  },
  {
    title: "Email (Resend)",
    section: "email",
    description: "Servicio de envío de emails transaccionales.",
    fields: [
      { label: "Email corporativo", key: "fromEmail", type: "email" },
      { label: "Resend API Key", key: "resendApiKey", type: "text", placeholder: "re_...", secret: true },
    ],
  },
];

const DEFAULTS: Record<string, Record<string, string>> = {
  general: { storeName: "NOIR LOVERS", contactEmail: "hello@noirlovers.com", phone: "+57 300 000 0000", city: "Bogotá, Colombia" },
  shipping: { shippingCost: "15000", freeShippingMin: "250000", deliveryDays: "2-5" },
  email: { fromEmail: "hello@noirlovers.com" },
};

export default function AjustesPage() {
  // values[section][key] = string
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  const loadSettings = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings");
    if (res.ok) {
      const d = await res.json();
      // Merge defaults with saved values
      const merged: Record<string, Record<string, string>> = {};
      for (const sec of SECTIONS_DEF) {
        merged[sec.section] = {
          ...(DEFAULTS[sec.section] ?? {}),
          ...(d.settings?.[sec.section] ?? {}),
        };
      }
      setValues(merged);
    } else {
      // Use defaults
      const merged: Record<string, Record<string, string>> = {};
      for (const sec of SECTIONS_DEF) {
        merged[sec.section] = { ...(DEFAULTS[sec.section] ?? {}) };
      }
      setValues(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const updateField = (section: string, key: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [section]: { ...(prev[section] ?? {}), [key]: value },
    }));
  };

  const handleSave = async (sectionDef: SectionDef) => {
    setSavingSection(sectionDef.section);
    const fields = sectionDef.fields.map((f) => ({
      key: f.key,
      value: values[sectionDef.section]?.[f.key] ?? "",
    }));
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: sectionDef.section, fields }),
    });
    if (res.ok) {
      setSavedSection(sectionDef.section);
      toast.success(`Sección "${sectionDef.title}" guardada`);
      setTimeout(() => setSavedSection(null), 2000);
    } else {
      toast.error("Error al guardar");
    }
    setSavingSection(null);
  };

  const toggleSecret = (key: string) =>
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-black uppercase mb-6">AJUSTES</h1>
        <div className="flex items-center gap-2 text-noir-gray-4 text-xs py-10">
          <Loader2 size={16} className="animate-spin" /> Cargando ajustes...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-black uppercase mb-6">AJUSTES</h1>
      <div className="space-y-6">
        {SECTIONS_DEF.map((sec) => (
          <div key={sec.section} className="bg-white border border-noir-gray-2 overflow-hidden">
            <div className="p-4 border-b border-noir-gray-2 bg-noir-gray">
              <h2 className="text-xs font-black uppercase tracking-widest">{sec.title}</h2>
              {sec.description && (
                <p className="text-[10px] text-noir-gray-4 mt-0.5">{sec.description}</p>
              )}
            </div>
            <div className="p-5 space-y-4">
              {sec.fields.map((field, fi) => {
                const visKey = `${sec.section}-${fi}`;
                const showValue = visible[visKey];
                const value = values[sec.section]?.[field.key] ?? "";
                return (
                  <div key={field.key} className="grid grid-cols-3 gap-4 items-center">
                    <label className="text-xs font-medium text-noir-gray-4 col-span-1">{field.label}</label>
                    <div className="col-span-2 relative max-w-sm">
                      <input
                        type={field.secret && !showValue ? "password" : field.type}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(sec.section, field.key, e.target.value)}
                        className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors pr-9"
                      />
                      {field.secret && (
                        <button
                          type="button"
                          onClick={() => toggleSecret(visKey)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-noir-gray-4 hover:text-noir-black transition-colors"
                        >
                          {showValue ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="px-5 pb-5">
              <button
                onClick={() => handleSave(sec)}
                disabled={savingSection === sec.section}
                className="flex items-center gap-2 bg-noir-black text-white px-5 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60"
              >
                {savingSection === sec.section ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : savedSection === sec.section ? (
                  <Check size={12} />
                ) : (
                  <Save size={12} />
                )}
                {savingSection === sec.section ? "GUARDANDO..." : savedSection === sec.section ? "GUARDADO ✓" : "GUARDAR"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
