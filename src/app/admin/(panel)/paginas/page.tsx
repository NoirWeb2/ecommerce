"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
ImageIcon, Type, Save, Eye, ToggleLeft, ToggleRight,
ChevronDown, ChevronUp, Upload, X, Plus, Trash2, Globe,
Check, Layout, Link as LinkIcon, Edit, Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ImageMeta { url: string; width: number | null; height: number | null; fileName: string }
interface BannerBlock {
id: string; label: string; image: ImageMeta; headline: string; subtext: string;
cta: string; ctaLink: string; textColor: "black" | "white"; visible: boolean;
}
interface TextBlock { id: string; label: string; content: string }
interface NavLink { label: string; href: string }
interface HeaderConfig {
logo: string; announcementText: string; announcementVisible: boolean;
navLinks: NavLink[];
}
interface FooterConfig {
tagline: string; col1Title: string; col2Title: string;
col1Links: NavLink[]; col2Links: NavLink[];
socialInstagram: string; socialTikTok: string; socialWhatsApp: string;
}
interface CustomPage { id: string; slug: string; title: string; blocks: PageBlock[]; description?: string; featuredImage?: string; seoTitle?: string; seoDesc?: string; status?: "published" | "draft" }
type BlockType = "heading" | "text" | "image" | "video" | "button" | "divider"
interface PageBlock { id: string; type: BlockType; content: string; extra?: string }

const blankMeta = (url = ""): ImageMeta => ({ url, width: null, height: null, fileName: "" });

function useImageDimensions() {
const getSize = useCallback((url: string): Promise<{ w: number; h: number }> => {
  return new Promise((res) => {
    if (typeof window === "undefined") return res({ w: 0, h: 0 });
const img = new window.Image();
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res({ w: 0, h: 0 });
    img.src = url;
  });
}, []);
return getSize;
}

function ImageUploader({ value, onChange, label, folder = "noir-lovers/pages" }: {
value: ImageMeta; onChange: (m: ImageMeta) => void; label: string; folder?: string;
}) {
const fileRef = useRef<HTMLInputElement>(null);
const [dragging, setDragging] = useState(false);
const [uploading, setUploading] = useState(false);
const getSize = useImageDimensions();

const uploadToCloudinary = async (file: File) => {
  setUploading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Error al subir");
    const { url } = await res.json();
    const { w, h } = await getSize(url);
    onChange({ url, width: w || null, height: h || null, fileName: file.name });
    toast.success(`"${file.name}" subida a Cloudinary`);
  } catch {
    toast.error("Error al subir la imagen. Verifica Cloudinary.");
  } finally {
    setUploading(false);
  }
};

const processUrl = async (url: string) => {
  if (!url) {
    onChange(blankMeta());
    return;
  }
  const { w, h } = await getSize(url);
  onChange({ url, width: w || null, height: h || null, fileName: url.split("/").pop() ?? "" });
};

return (
  <div>
    <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">{label}</label>
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) uploadToCloudinary(file);
      }}
      className={`relative border-2 border-dashed rounded transition-colors cursor-pointer ${dragging ? "border-noir-black bg-noir-gray" : "border-noir-gray-2 hover:border-noir-black"}`}
      onClick={() => !uploading && fileRef.current?.click()}
    >
      {uploading ? (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Loader2 size={20} className="text-noir-black animate-spin" />
          <p className="text-xs text-noir-gray-4">Subiendo a Cloudinary...</p>
        </div>
      ) : value.url ? (
        <div className="relative h-24 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value.url} alt="preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-noir-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Upload size={20} className="text-white" />
            <span className="text-white text-xs font-bold ml-2">SUBIR OTRA</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Upload size={20} className="text-noir-gray-4" />
          <p className="text-xs text-noir-gray-4">Arrastra una imagen o haz clic para subir</p>
          <p className="text-[10px] text-noir-gray-4">Se sube automáticamente a Cloudinary</p>
        </div>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadToCloudinary(f); e.target.value = ""; }} />
    </div>

    <div className="mt-2 flex items-center gap-2">
      <span className="text-[10px] text-noir-gray-4">o URL:</span>
      <input type="text" placeholder="https://res.cloudinary.com/... o /imagen.jpg"
        value={value.url}
        onChange={(e) => onChange({ ...value, url: e.target.value })}
        onBlur={(e) => processUrl(e.target.value)}
        onClick={(e) => e.stopPropagation()}
        className="flex-1 border border-noir-gray-2 px-3 py-1.5 text-xs outline-none focus:border-noir-black transition-colors" />
    </div>

    {value.url && !uploading && (
      <div className="mt-3 flex items-center justify-between border border-red-200 bg-red-50 px-3 py-2 rounded-sm">
        <div className="flex items-center gap-2 text-red-800">
          {value.width && value.height && (
            <span className="bg-red-200/50 px-1.5 py-0.5 text-[10px] font-bold rounded">
              {value.width}×{value.height}px
            </span>
          )}
          <span className="text-[10px] font-mono truncate max-w-[150px] sm:max-w-[200px]">
            {value.fileName || "Imagen actual"}
          </span>
        </div>
        <button 
          type="button" 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onChange(blankMeta()); }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 hover:text-red-800 uppercase tracking-widest transition-colors"
        >
          <Trash2 size={13} /> Eliminar
        </button>
      </div>
    )}
  </div>
);
}

const INIT_BANNERS: BannerBlock[] = [
{ id: "hero", label: "Hero principal", image: blankMeta("/hero-main.jpg"), headline: "VISTE LA OSCURIDAD.", subtext: "Nueva colección disponible", cta: "VER COLECCIÓN", ctaLink: "/tienda", textColor: "white", visible: true },
{ id: "collection1", label: "Slider 1 — UNIQUE VIBE", image: blankMeta("/banner-collection-1.webp"), headline: "UNIQUE VIBE", subtext: "Colección completa", cta: "EXPLORAR", ctaLink: "/tienda", textColor: "black", visible: true },
{ id: "collection2", label: "Slider 2 — UNIQUE VIBE", image: blankMeta("/banner-collection-2.webp"), headline: "UNIQUE VIBE II", subtext: "Nueva temporada", cta: "VER MÁS", ctaLink: "/tienda", textColor: "black", visible: true },
];

const INIT_TEXTS: TextBlock[] = [
{ id: "announcement", label: "Barra de anuncio", content: "🖤 ENVÍO GRATIS EN PEDIDOS +$250.000 — CÓDIGO: NOIR10 — 10% OFF EN TU PRIMERA COMPRA" },
{ id: "hero_sub", label: "Subtítulo del Hero", content: "Nueva colección disponible" },
{ id: "destacados_title", label: "Título sección DESTACADOS", content: "DESTACADOS" },
{ id: "nuevo_title", label: "Título sección NUEVO", content: "NUEVO" },
{ id: "categories_title", label: "Título sección CATEGORÍAS", content: "TIENDA POR CATEGORÍA" },
{ id: "footer_tagline", label: "Tagline del Footer", content: "Moda oscura desde Bogotá para el mundo." },
];

const INIT_HEADER: HeaderConfig = {
logo: "/logo.svg",
announcementText: "🖤 ENVÍO GRATIS EN PEDIDOS +$250.000 — CÓDIGO: NOIR10 — 10% OFF EN TU PRIMERA COMPRA",
announcementVisible: true,
navLinks: [
  { label: "TIENDA", href: "/tienda" },
  { label: "CATEGORÍAS", href: "/categoria/camisetas" },
  { label: "TOTAL LOOKS", href: "/total-looks" },
  { label: "NOSOTROS", href: "/nosotros" },
],
};

const INIT_FOOTER: FooterConfig = {
tagline: "Moda oscura desde Bogotá para el mundo.",
col1Title: "TIENDA",
col2Title: "AYUDA",
col1Links: [
  { label: "Camisetas", href: "/categoria/camisetas" },
  { label: "Pantalones", href: "/categoria/pantalones" },
  { label: "Hoodies", href: "/categoria/hoodies" },
  { label: "Total Looks", href: "/total-looks" },
],
col2Links: [
  { label: "Contacto", href: "/contacto" },
  { label: "Envíos", href: "/envios" },
  { label: "Devoluciones", href: "/devoluciones" },
  { label: "FAQ", href: "/faq" },
],
socialInstagram: "https://instagram.com/noirlovers",
socialTikTok: "https://tiktok.com/@noirlovers",
socialWhatsApp: "https://wa.me/573000000000",
};

type Tab = "banners" | "textos" | "filosofia" | "contacto" | "header" | "footer" | "paginas" | "seo";

function SectionCard({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
const [open, setOpen] = useState(true);
return (
  <div className="bg-white border border-noir-gray-2 overflow-hidden">
    <button onClick={() => setOpen(v => !v)}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-noir-gray/20 transition-colors">
      <div className="text-left">
        <p className="text-[10px] font-black tracking-widest uppercase">{label}</p>
        {hint && <p className="text-[10px] text-noir-gray-4 mt-0.5">{hint}</p>}
      </div>
      {open ? <ChevronUp size={14} className="text-noir-gray-4" /> : <ChevronDown size={14} className="text-noir-gray-4" />}
    </button>
    {open && <div className="border-t border-noir-gray-2 p-5">{children}</div>}
  </div>
);
}

export default function PaginasPage() {
const [tab, setTab] = useState<Tab>("banners");
const [banners, setBanners] = useState<BannerBlock[]>(INIT_BANNERS);
const [texts, setTexts] = useState<TextBlock[]>(INIT_TEXTS);
const [header, setHeader] = useState<HeaderConfig>(INIT_HEADER);
const [footer, setFooter] = useState<FooterConfig>(INIT_FOOTER);
const [customPages, setCustomPages] = useState<CustomPage[]>([]);
const [expanded, setExpanded] = useState<string | null>("hero");

const [filosofia, setFilosofia] = useState({
  visible: true,
  heroHeadline: "EL NEGRO\nLO ES TODO.",
  heroLocation: "BOGOTÁ, COLOMBIA",
  heroImage: blankMeta(),
  introLabel: "NUESTRA POSTURA",
  introTitle: "No es un color. No es una tendencia.\nEs una forma de estar en el mundo.",
  introBody: "NOIR LOVERS nació en Bogotá para los hombres que entienden que el negro no necesita justificación. Una identidad construida desde adentro, traducida en cada corte, cada tela, cada detalle.",
  splitLabel: "IDENTIDAD",
  splitTitle: "CONSTRUIDO\nDESDE ADENTRO.",
  splitPara1: "Cada prenda tiene un propósito. No diseñamos para el trend. Diseñamos para el hombre que sabe exactamente quién es y no necesita explicarlo.",
  splitPara2: "Materiales premium, cortes colombianos, acabados que duran. Calidad sin excusas, desde las calles de Bogotá hacia el mundo.",
  splitImage: blankMeta(),
  manifestoQuote: '"El negro lo contiene todo. El silencio, la fuerza, la elegancia. No necesita nada más."',
  manifestoAuthor: "FUNDADORES DE NOIR LOVERS",
  pilaresLabel: "LOS TRES PILARES",
  pilar1Title: "INTENCIÓN",
  pilar1Text: "Cada prenda tiene un propósito. Diseñamos para el hombre que sabe quién es, no para el que sigue tendencias.",
  pilar2Title: "CONSTRUCCIÓN",
  pilar2Text: "Materiales premium, cortes colombianos, acabados que duran. Calidad sin excusas, desde Bogotá.",
  pilar3Title: "ACTITUD",
  pilar3Text: "NOIR LOVERS no es ropa. Es la forma en que entras a un cuarto. La presencia que no necesita explanation.",
  bannerLabel: "COLECCIÓN NOIR",
  bannerHeadline: "VISTE LA\nOSCURIDAD.",
  bannerImage: blankMeta(),
  ctaLabel: "ÚNETE AL MOVIMIENTO",
  ctaTitle: "EMPIEZA CON\nEL NEGRO.",
  ctaBtn1Text: "VER COLECCIÓN",
  ctaBtn1Link: "/tienda",
  ctaBtn2Text: "NUESTRA HISTORIA",
  ctaBtn2Link: "/nosotros",
});

const [contacto, setContacto] = useState({
  email: "hola@noirlovers.co",
  whatsapp: "+57 300 000 0000",
  instagram: "@noirlovers.co",
  tiktok: "@noirlovers",
  ciudad: "Bogotá, Colombia",
  horario: "Lunes a Viernes 9am – 6pm",
  visible: true,
});

const [newPageOpen, setNewPageOpen] = useState(false);
const [editPageId, setEditPageId] = useState<string | null>(null);
const [saving, setSaving] = useState(false);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/admin/pages", { cache: "no-store" })
    .then((r) => r.json())
    .then(({ data }) => {
      if (!data) return;

      // Banners
      const bd = data.banners ?? {};
      if (bd.hero || bd.collection1 || bd.collection2) {
        setBanners((prev) => prev.map((b) => {
          const raw = bd[b.id];
          if (!raw) return b;
          try {
            const parsed = JSON.parse(raw);
            return { ...b, ...parsed, image: blankMeta(parsed.image ?? b.image.url) };
          } catch { return b; }
        }));
      }

      // Texts
      const td = data.texts ?? {};
      if (Object.keys(td).length > 0) {
        setTexts((prev) => prev.map((t) => td[t.id] ? { ...t, content: td[t.id] } : t));
      }

      // Filosofia
      const filosofiaRaw = data.pages?.filosofia ?? data.filosofia?.data;
      if (filosofiaRaw) {
        try {
          const parsed = JSON.parse(filosofiaRaw);
          setFilosofia((prev) => ({
            ...prev,
            ...parsed,
            heroImage: blankMeta(parsed.heroImage?.url ?? parsed.heroImage ?? ""),
            splitImage: blankMeta(parsed.splitImage?.url ?? parsed.splitImage ?? ""),
            bannerImage: blankMeta(parsed.bannerImage?.url ?? parsed.bannerImage ?? ""),
          }));
        } catch { }
      }

      // Contacto
      const contactoRaw = data.pages?.contacto ?? data.contacto?.data;
      if (contactoRaw) {
        try { setContacto((prev) => ({ ...prev, ...JSON.parse(contactoRaw) })); } catch { }
      }

      // Header
      const headerRaw = data.header?.data;
      if (headerRaw) {
        try { setHeader((prev) => ({ ...prev, ...JSON.parse(headerRaw) })); } catch { }
      }

      // Footer
      const footerRaw = data.layout?.footer ?? data.footer?.data;
      if (footerRaw) {
        try { setFooter((prev) => ({ ...prev, ...JSON.parse(footerRaw) })); } catch { }
      }
    })
    .catch(() => { })
    .finally(() => setLoading(false));
}, []);

const updateBanner = (id: string, patch: Partial<BannerBlock>) =>
  setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
const updateText = (id: string, content: string) =>
  setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, content } : t)));

const handleSave = async (section = "Cambios") => {
  setSaving(true);
  try {
    let body: { section: string; data: Record<string, string> } | null = null;

    if (section === "Banner" || section === "Cambios") {
      const bannerData: Record<string, string> = {};
      for (const b of banners) {
        bannerData[b.id] = JSON.stringify({
          image: b.image.url,
          headline: b.headline,
          subtext: b.subtext,
          cta: b.cta,
          ctaLink: b.ctaLink,
          textColor: b.textColor,
          visible: b.visible,
        });
      }
      body = { section: "banners", data: bannerData };
    } else if (section === "Textos") {
      const textData: Record<string, string> = {};
      for (const t of texts) textData[t.id] = t.content;
      body = { section: "texts", data: textData };
    } else if (section === "Filosofía") {
      const toSave = {
        ...filosofia,
        heroImage: filosofia.heroImage.url,
        splitImage: filosofia.splitImage.url,
        bannerImage: filosofia.bannerImage.url,
      };
      body = { section: "pages", data: { filosofia: JSON.stringify(toSave) } };
    } else if (section === "Contacto") {
      body = { section: "pages", data: { contacto: JSON.stringify(contacto) } };
    } else if (section === "Header") {
      body = { section: "header", data: { data: JSON.stringify(header) } };
    } else if (section === "Footer") {
      body = { section: "layout", data: { footer: JSON.stringify(footer) } };
    } else if (section === "SEO") {
      body = { section: "seo", data: { data: "saved" } };
    }

    if (body) {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Error al guardar");
    }

    toast.success(`${section} guardados correctamente`);
  } catch {
    toast.error("Error al guardar. Intenta de nuevo.");
  } finally {
    setSaving(false);
  }
};

const editingPage = customPages.find((p) => p.id === editPageId) ?? null;

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "banners", label: "Sliders & Banners", icon: <ImageIcon size={13} /> },
  { key: "textos", label: "Textos Home", icon: <Type size={13} /> },
  { key: "filosofia", label: "Filosofía", icon: <Edit size={13} /> },
  { key: "contacto", label: "Contacto", icon: <Globe size={13} /> },
  { key: "header", label: "Header", icon: <Layout size={13} /> },
  { key: "footer", label: "Footer", icon: <Layout size={13} /> },
  { key: "paginas", label: "Páginas personalizadas", icon: <Globe size={13} /> },
  { key: "seo", label: "SEO & Meta", icon: <Type size={13} /> },
];

return (
  <div>
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-black uppercase">PÁGINAS</h1>
      <div className="flex gap-2">
        <a href="/" target="_blank"
          className="flex items-center gap-2 border border-noir-gray-2 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
          <Eye size={13} /> VER TIENDA
        </a>
        <button onClick={() => {
          if (tab === "banners") handleSave("Banner");
          else if (tab === "textos") handleSave("Textos");
          else if (tab === "filosofia") handleSave("Filosofía");
          else if (tab === "contacto") handleSave("Contacto");
          else if (tab === "header") handleSave("Header");
          else if (tab === "footer") handleSave("Footer");
          else if (tab === "seo") handleSave("SEO");
        }} disabled={saving}
          className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {saving ? "GUARDANDO..." : "GUARDAR"}
        </button>
      </div>
    </div>

    <div className="flex gap-0 mb-6 border-b border-noir-gray-2 overflow-x-auto">
      {TABS.map((t) => (
        <button key={t.key} onClick={() => setTab(t.key)}
          className={`flex items-center gap-1.5 px-4 py-3 text-[10px] font-bold tracking-widest uppercase border-b-2 whitespace-nowrap transition-colors ${
            tab === t.key ? "border-noir-black text-noir-black" : "border-transparent text-noir-gray-4 hover:text-noir-black"
          }`}>
          {t.icon} {t.label}
        </button>
      ))}
    </div>

    {/* ══ BANNERS ══ */}
    {tab === "banners" && (
      <div className="space-y-3">
        {banners.map((b) => (
          <div key={b.id} className="bg-white border border-noir-gray-2 overflow-hidden">
            <button onClick={() => setExpanded(expanded === b.id ? null : b.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-noir-gray/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-cover bg-center flex-shrink-0 border border-noir-gray-2"
                  style={{ backgroundImage: `url(${b.image.url})` }} />
                <div className="text-left">
                  <p className="text-xs font-bold">{b.label}</p>
                  <p className="text-[10px] text-noir-gray-4 truncate max-w-xs">{b.headline}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={(e) => { e.stopPropagation(); updateBanner(b.id, { visible: !b.visible }); }}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase transition-colors ${b.visible ? "text-green-600" : "text-noir-gray-4"}`}>
                  {b.visible ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {b.visible ? "Activo" : "Oculto"}
                </button>
                {expanded === b.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {expanded === b.id && (
              <div className="border-t border-noir-gray-2 p-5 space-y-5">
                <ImageUploader label="IMAGEN DEL BANNER" value={b.image} onChange={(m) => updateBanner(b.id, { image: m })} />
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">COLOR DEL TEXTO SOBRE LA IMAGEN</label>
                  <div className="flex gap-2 max-w-xs">
                    {(["white", "black"] as const).map((color) => (
                      <button key={color} onClick={() => updateBanner(b.id, { textColor: color })}
                        className={`flex-1 py-2.5 text-xs font-bold uppercase border transition-colors ${
                          b.textColor === color
                            ? color === "white" ? "bg-noir-black text-white border-noir-black" : "bg-white text-noir-black border-noir-black"
                            : "border-noir-gray-2 hover:border-noir-black"
                        }`}>
                        {color === "white" ? "⬜ BLANCO" : "⬛ NEGRO"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TITULAR</label>
                    <input type="text" value={b.headline} onChange={(e) => updateBanner(b.id, { headline: e.target.value })}
                      className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">SUBTEXTO</label>
                    <input type="text" value={b.subtext} onChange={(e) => updateBanner(b.id, { subtext: e.target.value })}
                      className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TEXTO BOTÓN</label>
                    <input type="text" value={b.cta} onChange={(e) => updateBanner(b.id, { cta: e.target.value })}
                      className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">ENLACE BOTÓN</label>
                    <input type="text" value={b.ctaLink} onChange={(e) => updateBanner(b.id, { ctaLink: e.target.value })}
                      className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
                  </div>
                </div>
                {b.image.url && (
                  <div className="border border-noir-gray-2 overflow-hidden">
                    <p className="text-[10px] font-bold tracking-widest uppercase px-3 py-2 bg-noir-gray border-b border-noir-gray-2">VISTA PREVIA</p>
                    <div className="relative h-28 bg-cover bg-center flex items-end p-4" style={{ backgroundImage: `url(${b.image.url})` }}>
                      <div className={b.textColor === "white" ? "text-white" : "text-noir-black"}>
                        <p className="text-xs font-black uppercase">{b.headline}</p>
                        <p className="text-[10px] opacity-70">{b.subtext}</p>
                      </div>
                    </div>
                  </div>
                )}
                <button onClick={() => handleSave("Banner")} disabled={saving}
                  className="flex items-center gap-2 bg-noir-black text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-60">
                  {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} GUARDAR BANNER
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* ══ TEXTOS ══ */}
    {tab === "textos" && (
      <div className="space-y-4">
        {texts.map((t) => (
          <div key={t.id} className="bg-white border border-noir-gray-2 p-5">
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-2">{t.label}</label>
            <textarea rows={t.id === "announcement" ? 2 : 1}
              value={t.content} onChange={(e) => updateText(t.id, e.target.value)}
              className="w-full border border-noir-gray-2 px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors resize-none" />
          </div>
        ))}
        <button onClick={() => handleSave("Textos")}
          className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          <Save size={13} /> GUARDAR TEXTOS
        </button>
      </div>
    )}

    {/* ══ FILOSOFÍA ══ */}
    {tab === "filosofia" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-noir-gray-2">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest">Página Filosofía <span className="font-mono text-noir-gray-4 normal-case font-normal">/filosofia</span></h2>
            <p className="text-[10px] text-noir-gray-4 mt-0.5">Edita cada sección de la página independientemente</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/filosofia" target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-noir-gray-4 hover:text-noir-black flex items-center gap-1 border border-noir-gray-2 px-3 py-1.5 hover:border-noir-black transition-colors">
              <Eye size={11} /> VER PÁGINA
            </a>
            <button onClick={() => setFilosofia(f => ({ ...f, visible: !f.visible }))}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 border transition-colors ${filosofia.visible ? "bg-green-50 border-green-300 text-green-700" : "border-noir-gray-2 text-noir-gray-4"}`}>
              {filosofia.visible ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
              {filosofia.visible ? "Visible" : "Oculta"}
            </button>
          </div>
        </div>

        <SectionCard label="1 — HERO" hint="Banner de pantalla completa al entrar a /filosofia">
          <ImageUploader label="IMAGEN DE FONDO DEL HERO" value={filosofia.heroImage} onChange={m => setFilosofia(f => ({ ...f, heroImage: m }))} />
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">TITULAR (usa \n para salto de línea)</label>
              <textarea rows={2} value={filosofia.heroHeadline} onChange={e => setFilosofia(f => ({ ...f, heroHeadline: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none font-black uppercase" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ETIQUETA INFERIOR (ciudad)</label>
              <input type="text" value={filosofia.heroLocation} onChange={e => setFilosofia(f => ({ ...f, heroLocation: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
          </div>
        </SectionCard>

        <SectionCard label="2 — INTRO" hint="Sección de texto centrado debajo del hero">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ETIQUETA SUPERIOR</label>
              <input type="text" value={filosofia.introLabel} onChange={e => setFilosofia(f => ({ ...f, introLabel: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">TÍTULO GRANDE</label>
              <textarea rows={2} value={filosofia.introTitle} onChange={e => setFilosofia(f => ({ ...f, introTitle: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none font-black" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">PÁRRAFO</label>
            <textarea rows={3} value={filosofia.introBody} onChange={e => setFilosofia(f => ({ ...f, introBody: e.target.value }))}
              className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none" />
          </div>
        </SectionCard>

        <SectionCard label="3 — IMAGEN + TEXTO (IDENTIDAD)" hint="Sección de dos columnas: foto izquierda, texto derecha">
          <div className="grid sm:grid-cols-2 gap-6">
            <ImageUploader label="FOTO LATERAL" value={filosofia.splitImage} onChange={m => setFilosofia(f => ({ ...f, splitImage: m }))} />
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ETIQUETA</label>
                <input type="text" value={filosofia.splitLabel} onChange={e => setFilosofia(f => ({ ...f, splitLabel: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">TÍTULO</label>
                <textarea rows={2} value={filosofia.splitTitle} onChange={e => setFilosofia(f => ({ ...f, splitTitle: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none font-black uppercase" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">PÁRRAFO 1</label>
                <textarea rows={3} value={filosofia.splitPara1} onChange={e => setFilosofia(f => ({ ...f, splitPara1: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">PÁRRAFO 2</label>
                <textarea rows={3} value={filosofia.splitPara2} onChange={e => setFilosofia(f => ({ ...f, splitPara2: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard label="4 — MANIFIESTO" hint="Sección negra con cita grande centrada">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">CITA</label>
              <textarea rows={4} value={filosofia.manifestoQuote} onChange={e => setFilosofia(f => ({ ...f, manifestoQuote: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none font-black" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ATRIBUCIÓN (debajo de la cita)</label>
              <input type="text" value={filosofia.manifestoAuthor} onChange={e => setFilosofia(f => ({ ...f, manifestoAuthor: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
          </div>
        </SectionCard>

        <SectionCard label="5 — LOS TRES PILARES" hint="Grid de 3 columnas con número, título y texto">
          <div className="mb-4">
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ETIQUETA DE SECCIÓN</label>
            <input type="text" value={filosofia.pilaresLabel} onChange={e => setFilosofia(f => ({ ...f, pilaresLabel: e.target.value }))}
              className="w-full max-w-sm border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {([
              { titleKey: "pilar1Title" as const, textKey: "pilar1Text" as const, num: "01" },
              { titleKey: "pilar2Title" as const, textKey: "pilar2Text" as const, num: "02" },
              { titleKey: "pilar3Title" as const, textKey: "pilar3Text" as const, num: "03" },
            ]).map(({ titleKey, textKey, num }) => (
              <div key={num} className="border border-noir-gray-2 p-4">
                <p className="text-[10px] font-bold text-noir-gray-4 mb-2">{num}</p>
                <input type="text" value={filosofia[titleKey]} onChange={e => setFilosofia(f => ({ ...f, [titleKey]: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm font-bold uppercase outline-none focus:border-noir-black transition-colors mb-2" />
                <textarea rows={3} value={filosofia[textKey]} onChange={e => setFilosofia(f => ({ ...f, [textKey]: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors resize-none" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard label='6 — BANNER "VISTE LA OSCURIDAD"' hint="Banner ancho con imagen de fondo y texto superpuesto">
          <div className="grid sm:grid-cols-2 gap-6">
            <ImageUploader label="IMAGEN DE FONDO" value={filosofia.bannerImage} onChange={m => setFilosofia(f => ({ ...f, bannerImage: m }))} />
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ETIQUETA</label>
                <input type="text" value={filosofia.bannerLabel} onChange={e => setFilosofia(f => ({ ...f, bannerLabel: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">TITULAR</label>
                <textarea rows={2} value={filosofia.bannerHeadline} onChange={e => setFilosofia(f => ({ ...f, bannerHeadline: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none font-black uppercase" />
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard label="7 — CTA FINAL" hint='Sección blanca "Empieza con el negro" con dos botones'>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">ETIQUETA SUPERIOR</label>
              <input type="text" value={filosofia.ctaLabel} onChange={e => setFilosofia(f => ({ ...f, ctaLabel: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">TÍTULO</label>
              <textarea rows={2} value={filosofia.ctaTitle} onChange={e => setFilosofia(f => ({ ...f, ctaTitle: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none font-black uppercase" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">BOTÓN 1 — TEXTO</label>
              <input type="text" value={filosofia.ctaBtn1Text} onChange={e => setFilosofia(f => ({ ...f, ctaBtn1Text: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">BOTÓN 1 — ENLACE</label>
              <input type="text" value={filosofia.ctaBtn1Link} onChange={e => setFilosofia(f => ({ ...f, ctaBtn1Link: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm font-mono outline-none focus:border-noir-black transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">BOTÓN 2 — TEXTO</label>
              <input type="text" value={filosofia.ctaBtn2Text} onChange={e => setFilosofia(f => ({ ...f, ctaBtn2Text: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">BOTÓN 2 — ENLACE</label>
              <input type="text" value={filosofia.ctaBtn2Link} onChange={e => setFilosofia(f => ({ ...f, ctaBtn2Link: e.target.value }))}
                className="w-full border border-noir-gray-2 px-3 py-2 text-sm font-mono outline-none focus:border-noir-black transition-colors" />
            </div>
          </div>
        </SectionCard>

        <button onClick={() => handleSave("Filosofía")}
          className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          <Save size={13} /> GUARDAR FILOSOFÍA
        </button>
      </div>
    )}

    {/* ══ CONTACTO ══ */}
    {tab === "contacto" && (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-noir-gray-2">
          <div>
            <h2 className="text-xs font-black uppercase tracking-widest">Página Contacto <span className="font-mono text-noir-gray-4 normal-case font-normal">/contacto</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <a href="/contacto" target="_blank" className="text-[10px] font-bold uppercase tracking-widest text-noir-gray-4 hover:text-noir-black flex items-center gap-1 border border-noir-gray-2 px-3 py-1.5 hover:border-noir-black transition-colors">
              <Eye size={11} /> VER PÁGINA
            </a>
          </div>
        </div>
        <div className="bg-white border border-noir-gray-2 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {([
              { key: "email" as const, label: "EMAIL", type: "email" },
              { key: "whatsapp" as const, label: "WHATSAPP", type: "text" },
              { key: "instagram" as const, label: "INSTAGRAM", type: "text" },
              { key: "tiktok" as const, label: "TIKTOK", type: "text" },
              { key: "ciudad" as const, label: "CIUDAD", type: "text" },
              { key: "horario" as const, label: "HORARIO", type: "text" },
            ]).map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5 text-noir-gray-4">{label}</label>
                <input type={type} value={contacto[key]} onChange={e => setContacto(c => ({ ...c, [key]: e.target.value }))}
                  className="w-full border border-noir-gray-2 px-4 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
              </div>
            ))}
          </div>
          <button onClick={() => handleSave("Contacto")}
            className="flex items-center gap-2 bg-noir-black text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
            <Save size={12} /> GUARDAR CONTACTO
          </button>
        </div>
      </div>
    )}

    {/* ══ HEADER ══ */}
    {tab === "header" && (
      <div className="space-y-5">
        <div className="bg-white border border-noir-gray-2 p-5 space-y-5">
          <h2 className="text-xs font-black uppercase tracking-widest border-b border-noir-gray-2 pb-3">LOGOTIPO</h2>
          <ImageUploader label="IMAGEN DEL LOGO" value={blankMeta(header.logo)} onChange={(m) => setHeader({ ...header, logo: m.url })} />
        </div>
        <div className="bg-white border border-noir-gray-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-noir-gray-2 pb-3">
            <h2 className="text-xs font-black uppercase tracking-widest">BARRA DE ANUNCIO</h2>
            <button onClick={() => setHeader({ ...header, announcementVisible: !header.announcementVisible })}
              className={`flex items-center gap-1.5 text-[10px] font-bold uppercase transition-colors ${header.announcementVisible ? "text-green-600" : "text-noir-gray-4"}`}>
              {header.announcementVisible ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              {header.announcementVisible ? "Visible" : "Oculta"}
            </button>
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TEXTO</label>
            <input type="text" value={header.announcementText} onChange={(e) => setHeader({ ...header, announcementText: e.target.value })}
              className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
          </div>
        </div>
        <div className="bg-white border border-noir-gray-2 p-5 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest border-b border-noir-gray-2 pb-3">LINKS DE NAVEGACIÓN</h2>
          <div className="space-y-2">
            {header.navLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" placeholder="Etiqueta" value={link.label}
                  onChange={(e) => { const l = [...header.navLinks]; l[i] = { ...l[i], label: e.target.value }; setHeader({ ...header, navLinks: l }); }}
                  className="flex-1 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
                <LinkIcon size={12} className="text-noir-gray-4 flex-shrink-0" />
                <input type="text" placeholder="/ruta" value={link.href}
                  onChange={(e) => { const l = [...header.navLinks]; l[i] = { ...l[i], href: e.target.value }; setHeader({ ...header, navLinks: l }); }}
                  className="flex-1 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black font-mono transition-colors" />
                <button onClick={() => { const l = header.navLinks.filter((_, j) => j !== i); setHeader({ ...header, navLinks: l }); }}
                  className="text-noir-gray-4 hover:text-red-500 transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => setHeader({ ...header, navLinks: [...header.navLinks, { label: "", href: "/" }] })}
              className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-noir-gray-4 hover:text-noir-black transition-colors mt-2">
              <Plus size={13} /> AGREGAR LINK
            </button>
          </div>
        </div>
        <button onClick={() => handleSave("Header")}
          className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          <Save size={13} /> GUARDAR HEADER
        </button>
      </div>
    )}

    {/* ══ FOOTER ══ */}
    {tab === "footer" && (
      <div className="space-y-5">
        <div className="bg-white border border-noir-gray-2 p-5 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest border-b border-noir-gray-2 pb-3">GENERAL</h2>
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TAGLINE</label>
            <input type="text" value={footer.tagline} onChange={(e) => setFooter({ ...footer, tagline: e.target.value })}
              className="w-full border border-noir-gray-2 px-3 py-2.5 text-sm outline-none focus:border-noir-black transition-colors" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {([
              { label: "Instagram", key: "socialInstagram" as const },
              { label: "TikTok", key: "socialTikTok" as const },
              { label: "WhatsApp", key: "socialWhatsApp" as const },
            ]).map((s) => (
              <div key={s.key}>
                <label className="block text-[10px] font-bold tracking-widests uppercase mb-1.5">{s.label}</label>
                <input type="text" value={footer[s.key]} onChange={(e) => setFooter({ ...footer, [s.key]: e.target.value })}
                  className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors" />
              </div>
            ))}
          </div>
        </div>
        {([{ title: "col1Title", links: "col1Links" }, { title: "col2Title", links: "col2Links" }] as const).map((col, ci) => (
          <div key={ci} className="bg-white border border-noir-gray-2 p-5 space-y-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">TÍTULO DE COLUMNA {ci + 1}</label>
              <input type="text" value={footer[col.title]} onChange={(e) => setFooter({ ...footer, [col.title]: e.target.value })}
                className="w-full max-w-xs border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            </div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-noir-gray-4">LINKS</p>
            <div className="space-y-2">
              {footer[col.links].map((link, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="text" placeholder="Etiqueta" value={link.label}
                    onChange={(e) => { const l = [...footer[col.links]]; l[i] = { ...l[i], label: e.target.value }; setFooter({ ...footer, [col.links]: l }); }}
                    className="flex-1 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
                  <LinkIcon size={12} className="text-noir-gray-4 flex-shrink-0" />
                  <input type="text" placeholder="/ruta" value={link.href}
                    onChange={(e) => { const l = [...footer[col.links]]; l[i] = { ...l[i], href: e.target.value }; setFooter({ ...footer, [col.links]: l }); }}
                    className="flex-1 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black font-mono transition-colors" />
                  <button onClick={() => setFooter({ ...footer, [col.links]: footer[col.links].filter((_, j) => j !== i) })}
                    className="text-noir-gray-4 hover:text-red-500 transition-colors flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button onClick={() => setFooter({ ...footer, [col.links]: [...footer[col.links], { label: "", href: "/" }] })}
                className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-noir-gray-4 hover:text-noir-black transition-colors">
                <Plus size={13} /> AGREGAR LINK
              </button>
            </div>
          </div>
        ))}
        <button onClick={() => handleSave("Footer")}
          className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          <Save size={13} /> GUARDAR FOOTER
        </button>
      </div>
    )}

    {/* ══ PÁGINAS PERSONALIZADAS ══ */}
    {tab === "paginas" && !editPageId && (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-noir-gray-4">Crea páginas libres: política de privacidad, FAQ, landing especial…</p>
          <button onClick={() => setNewPageOpen(true)}
            className="flex items-center gap-2 bg-noir-black text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
            <Plus size={13} /> NUEVA PÁGINA
          </button>
        </div>
        {customPages.length === 0 ? (
          <div className="bg-white border border-noir-gray-2 p-12 text-center">
            <Globe size={32} className="text-noir-gray-3 mx-auto mb-3" />
            <p className="text-sm text-noir-gray-4">No hay páginas personalizadas aún.</p>
          </div>
        ) : (
          <div className="bg-white border border-noir-gray-2 divide-y divide-noir-gray">
            {customPages.map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-bold">{p.title}</p>
                  <p className="text-xs text-noir-gray-4 font-mono">/{p.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/${p.slug}`} target="_blank" className="text-noir-gray-4 hover:text-noir-black transition-colors"><Eye size={14} /></a>
                  <button onClick={() => setEditPageId(p.id)} className="text-noir-gray-4 hover:text-noir-black transition-colors"><Edit size={14} /></button>
                  <button onClick={() => { setCustomPages((prev) => prev.filter((x) => x.id !== p.id)); toast.success("Página eliminada"); }}
                    className="text-noir-gray-4 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {tab === "paginas" && editingPage && (
      <PageBlockEditor
        page={editingPage}
        onSave={(updated) => {
          setCustomPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
          setEditPageId(null);
          toast.success("Página guardada");
        }}
        onBack={() => setEditPageId(null)}
      />
    )}

    {/* ══ SEO ══ */}
    {tab === "seo" && (
      <div className="space-y-4">
        {[
          { page: "Inicio (/)", fields: ["Title", "Description", "OG Image URL"] },
          { page: "Tienda (/tienda)", fields: ["Title", "Description"] },
          { page: "Nosotros (/nosotros)", fields: ["Title", "Description"] },
          { page: "Filosofía (/filosofia)", fields: ["Title", "Description"] },
        ].map((s) => (
          <div key={s.page} className="bg-white border border-noir-gray-2 overflow-hidden">
            <div className="p-4 border-b border-noir-gray-2 bg-noir-gray">
              <h3 className="text-xs font-black uppercase tracking-widest">{s.page}</h3>
            </div>
            <div className="p-5 space-y-3">
              {s.fields.map((f) => (
                <div key={f} className="grid grid-cols-3 gap-4 items-center">
                  <label className="text-xs font-medium text-noir-gray-4">{f}</label>
                  <input type="text" className="col-span-2 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={() => handleSave("SEO")}
          className="flex items-center gap-2 bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
          <Save size={13} /> GUARDAR SEO
        </button>
      </div>
    )}

    {newPageOpen && (
      <NewPageModal
        onCreate={(p) => { setCustomPages((prev) => [...prev, p]); setNewPageOpen(false); setEditPageId(p.id); }}
        onClose={() => setNewPageOpen(false)}
      />
    )}
  </div>
);
}

function NewPageModal({ onCreate, onClose }: { onCreate: (p: CustomPage) => void; onClose: () => void }) {
const empty: CustomPage = { id: Date.now().toString(), slug: "", title: "", blocks: [], status: "draft" };
return <PageBlockEditor page={empty} isNew onSave={(p) => { onCreate(p as CustomPage); }} onBack={onClose} />;
}

interface ExtendedPage extends CustomPage {
description?: string; featuredImage?: string; seoTitle?: string; seoDesc?: string; status?: "published" | "draft";
}

const BLOCK_TYPES_DEF: { type: BlockType; label: string; desc: string; icon: React.ReactNode }[] = [
{ type: "heading", label: "Título", desc: "H2 o H3 de sección", icon: <span className="font-black text-base">H</span> },
{ type: "text", label: "Párrafo", desc: "Bloque de texto libre", icon: <span className="font-bold text-sm">¶</span> },
{ type: "image", label: "Imagen", desc: "Sube una foto o video corto", icon: <ImageIcon size={15} /> },
{ type: "video", label: "Video", desc: "URL de YouTube o Vimeo", icon: <span className="font-bold text-sm">▶</span> },
{ type: "button", label: "Botón CTA", desc: "Llamada a la acción", icon: <span className="font-bold text-xs">[ ]</span> },
{ type: "divider", label: "Divisor", desc: "Línea separadora", icon: <span className="font-bold text-sm">—</span> },
];

function PageBlockEditor({ page, isNew = false, onSave, onBack }: {
page: CustomPage | ExtendedPage; isNew?: boolean;
onSave: (p: ExtendedPage) => void; onBack: () => void;
}) {
const ext = page as ExtendedPage;
const [title, setTitle] = useState(ext.title || "");
const [slug, setSlug] = useState(ext.slug || "");
const [description, setDesc] = useState(ext.description || "");
const [featuredImage, setFeatImg] = useState(ext.featuredImage || "");
const [seoTitle, setSeoTitle] = useState(ext.seoTitle || "");
const [seoDesc, setSeoDesc] = useState(ext.seoDesc || "");
const [status, setStatus] = useState<"published" | "draft">(ext.status ?? (isNew ? "draft" : "published"));
const [blocks, setBlocks] = useState<PageBlock[]>(page.blocks || []);
const [showBlockPicker, setShowBlockPicker] = useState(false);
const [showSeo, setShowSeo] = useState(false);
const [previewMode, setPreviewMode] = useState(false);
const featImgRef = useRef<HTMLInputElement>(null);
const getSize = useImageDimensions();

const autoSlug = (t: string) =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const handleTitleChange = (v: string) => { setTitle(v); if (isNew) setSlug(autoSlug(v)); };
const addBlock = (type: BlockType) => { setBlocks((prev) => [...prev, { id: Date.now().toString(), type, content: "", extra: "" }]); setShowBlockPicker(false); };
const updateBlock = (id: string, patch: Partial<PageBlock>) => setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));
const moveBlock = (id: string, dir: "up" | "down") => {
  setBlocks((prev) => {
    const idx = prev.findIndex((b) => b.id === id);
    if (dir === "up" && idx === 0) return prev;
    if (dir === "down" && idx === prev.length - 1) return prev;
    const next = [...prev];
    const swap = dir === "up" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    return next;
  });
};

const handleBlockImageFile = async (file: File, blockId: string) => {
  const url = URL.createObjectURL(file);
  const { w, h } = await getSize(url);
  updateBlock(blockId, { content: url, extra: `${w}×${h}px — ${file.name}` });
};

const handleSave = (publishStatus?: "published" | "draft") => {
  if (!title.trim()) { toast.error("El título es requerido"); return; }
  if (!slug.trim()) { toast.error("El slug (URL) es requerido"); return; }
  onSave({ id: page.id || Date.now().toString(), title, slug, blocks, description, featuredImage, seoTitle, seoDesc, status: publishStatus ?? status });
  toast.success(publishStatus === "published" ? "Página publicada" : "Borrador guardado");
};

return (
  <div className="fixed inset-0 z-[60] bg-[#f0f0f0] flex flex-col overflow-hidden">
    <div className="bg-white border-b border-noir-gray-2 px-5 py-3 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-noir-gray-4 hover:text-noir-black transition-colors tracking-widest uppercase">
          <X size={14} /> CERRAR
        </button>
        <span className="text-noir-gray-2">|</span>
        <span className="text-[10px] font-bold tracking-widest uppercase text-noir-gray-4">{isNew ? "NUEVA PÁGINA" : "EDITAR PÁGINA"}</span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${status === "published" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
          {status === "published" ? "Publicada" : "Borrador"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setPreviewMode((v) => !v)}
          className={`flex items-center gap-1.5 border px-4 py-2 text-[10px] font-bold tracking-widest uppercase transition-colors ${previewMode ? "border-noir-black bg-noir-black text-white" : "border-noir-gray-2 hover:border-noir-black"}`}>
          <Eye size={12} /> {previewMode ? "EDITOR" : "VISTA PREVIA"}
        </button>
        <button onClick={() => handleSave("draft")} className="border border-noir-gray-2 px-4 py-2 text-[10px] font-bold tracking-widest uppercase hover:border-noir-black transition-colors">
          GUARDAR BORRADOR
        </button>
        <button onClick={() => handleSave("published")} className="bg-noir-black text-white px-5 py-2 text-[10px] font-bold tracking-widest uppercase hover:bg-black transition-colors flex items-center gap-1.5">
          <Check size={12} /> PUBLICAR
        </button>
      </div>
    </div>

    <div className="flex-1 overflow-hidden flex">
      <div className="flex-1 overflow-y-auto">
        {previewMode ? (
          <div className="max-w-2xl mx-auto py-12 px-6">
            {featuredImage && <img src={featuredImage} alt="Featured" className="w-full max-h-64 object-cover mb-8" />}
            <h1 className="text-4xl font-black uppercase mb-4">{title || "Sin título"}</h1>
            {description && <p className="text-base text-noir-gray-4 mb-8 leading-relaxed">{description}</p>}
            <div className="space-y-6">
              {blocks.map((b) => (
                <div key={b.id}>
                  {b.type === "heading" && <h2 className="text-2xl font-black uppercase">{b.content || "Título vacío"}</h2>}
                  {b.type === "text" && <p className="text-sm leading-relaxed text-noir-gray-4 whitespace-pre-wrap">{b.content || "(párrafo vacío)"}</p>}
                  {b.type === "image" && b.content && <img src={b.content} alt="" className="w-full object-cover" />}
                  {b.type === "button" && <button className="bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase">{b.content || "Botón"}</button>}
                  {b.type === "divider" && <hr className="border-noir-gray-2" />}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto py-10 px-6">
            <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="Título de la página"
              className="w-full text-3xl font-black uppercase outline-none bg-transparent border-b-2 border-transparent focus:border-noir-black transition-colors pb-2 mb-3 placeholder-noir-gray-3" />
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xs text-noir-gray-4 font-mono">noirlovers.com/</span>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="url-de-la-pagina"
                className="text-xs font-mono text-noir-gray-4 outline-none border-b border-transparent focus:border-noir-gray-4 transition-colors bg-transparent" />
            </div>
            <textarea value={description} onChange={(e) => setDesc(e.target.value)} rows={2} placeholder="Descripción breve..."
              className="w-full text-sm text-noir-gray-4 outline-none bg-transparent border border-noir-gray-2 px-4 py-3 focus:border-noir-black transition-colors resize-none mb-6" />
            <div className="mb-6">
              <p className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-2">IMAGEN DESTACADA</p>
              {featuredImage ? (
                <div className="relative group">
                  <img src={featuredImage} alt="Featured" className="w-full max-h-48 object-cover" />
                  <div className="absolute inset-0 bg-noir-black/0 group-hover:bg-noir-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => featImgRef.current?.click()} className="bg-white text-noir-black px-3 py-1.5 text-[10px] font-bold">CAMBIAR</button>
                    <button onClick={() => setFeatImg("")} className="bg-red-600 text-white px-3 py-1.5 text-[10px] font-bold">QUITAR</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => featImgRef.current?.click()}
                  className="w-full border-2 border-dashed border-noir-gray-2 py-8 text-center hover:border-noir-black transition-colors">
                  <Upload size={20} className="mx-auto text-noir-gray-4 mb-2" />
                  <p className="text-xs text-noir-gray-4">Haz clic para subir la imagen destacada</p>
                </button>
              )}
              <input ref={featImgRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) setFeatImg(URL.createObjectURL(f)); }} />
            </div>
            <div className="border-t border-noir-gray-2 mb-6" />
            <div className="space-y-3 mb-4">
              {blocks.length === 0 && (
                <div onClick={() => setShowBlockPicker(true)}
                  className="border-2 border-dashed border-noir-gray-2 p-10 text-center cursor-pointer hover:border-noir-black transition-colors">
                  <Plus size={20} className="mx-auto text-noir-gray-4 mb-2" />
                  <p className="text-xs text-noir-gray-4">Haz clic para agregar el primer bloque</p>
                </div>
              )}
              {blocks.map((b, idx) => (
                <BlockWidget key={b.id} block={b} idx={idx} total={blocks.length}
                  onUpdate={(patch) => updateBlock(b.id, patch)}
                  onRemove={() => removeBlock(b.id)}
                  onMove={(dir) => moveBlock(b.id, dir)}
                  onImageFile={(file) => handleBlockImageFile(file, b.id)}
                  onVideoFile={(file) => updateBlock(b.id, { content: URL.createObjectURL(file), extra: file.name })}
                />
              ))}
            </div>
            <button onClick={() => setShowBlockPicker((v) => !v)}
              className="w-full flex items-center justify-center gap-2 border border-dashed border-noir-gray-2 py-3 text-xs font-bold text-noir-gray-4 hover:border-noir-black hover:text-noir-black transition-colors">
              <Plus size={13} /> AGREGAR BLOQUE
            </button>
            {showBlockPicker && (
              <div className="mt-3 bg-white border border-noir-gray-2 p-4">
                <p className="text-[10px] font-black tracking-widest uppercase text-noir-gray-4 mb-3">TIPO DE BLOQUE</p>
                <div className="grid grid-cols-3 gap-2">
                  {BLOCK_TYPES_DEF.map((bt) => (
                    <button key={bt.type} onClick={() => addBlock(bt.type)}
                      className="flex flex-col items-center gap-1.5 border border-noir-gray-2 p-3 hover:border-noir-black hover:bg-noir-gray transition-colors text-center">
                      <span className="text-noir-black">{bt.icon}</span>
                      <span className="text-[10px] font-bold uppercase">{bt.label}</span>
                      <span className="text-[9px] text-noir-gray-4">{bt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-8 border border-noir-gray-2 bg-white">
              <button onClick={() => setShowSeo((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 text-[10px] font-black tracking-widest uppercase">
                <span className="flex items-center gap-2"><Globe size={12} /> SEO Y METADATOS</span>
                {showSeo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {showSeo && (
                <div className="border-t border-noir-gray-2 p-5 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">SEO TITLE</label>
                    <input type="text" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)}
                      className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-widest uppercase mb-1.5">META DESCRIPTION</label>
                    <textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} maxLength={160}
                      className="w-full border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors resize-none" />
                    <p className="text-[10px] text-noir-gray-4 mt-1 text-right">{seoDesc.length}/160</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {!previewMode && (
        <div className="w-56 bg-white border-l border-noir-gray-2 flex-shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-noir-gray-2">
            <p className="text-[10px] font-black tracking-widest uppercase mb-3">PUBLICACIÓN</p>
            <select value={status} onChange={(e) => setStatus(e.target.value as "published" | "draft")}
              className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black transition-colors bg-white">
              <option value="published">Publicada</option>
              <option value="draft">Borrador</option>
            </select>
          </div>
          <div className="p-4 border-b border-noir-gray-2">
            <p className="text-[10px] font-black tracking-widest uppercase mb-1.5">URL DE LA PÁGINA</p>
            <p className="text-[9px] text-noir-gray-4 font-mono break-all">noirlovers.com/{slug || "..."}</p>
          </div>
          <div className="p-4">
            <p className="text-[10px] font-black tracking-widest uppercase mb-2">BLOQUES</p>
            <p className="text-xs font-bold">{blocks.length} bloque{blocks.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      )}
    </div>
  </div>
);
}

function BlockWidget({ block, idx, total, onUpdate, onRemove, onMove, onImageFile, onVideoFile }: {
block: PageBlock; idx: number; total: number;
onUpdate: (patch: Partial<PageBlock>) => void;
onRemove: () => void; onMove: (dir: "up" | "down") => void;
onImageFile: (f: File) => void; onVideoFile: (f: File) => void;
}) {
const imgRef = useRef<HTMLInputElement>(null);
const videoRef = useRef<HTMLInputElement>(null);

return (
  <div className="group bg-white border border-noir-gray-2 p-4 hover:border-noir-gray-3 transition-colors">
    <div className="flex items-start gap-3">
      <span className="text-[9px] font-bold uppercase tracking-widest bg-noir-gray px-2 py-1 text-noir-gray-4 flex-shrink-0 mt-0.5">{block.type}</span>
      <div className="flex-1 min-w-0">
        {block.type === "heading" && (
          <input type="text" placeholder="Escribe el título..." value={block.content} onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full text-xl font-black uppercase outline-none border-b border-transparent focus:border-noir-gray-2 transition-colors bg-transparent" />
        )}
        {block.type === "text" && (
          <textarea rows={4} placeholder="Escribe el contenido..." value={block.content} onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full text-sm outline-none border border-noir-gray-2 px-3 py-2 focus:border-noir-black transition-colors resize-y" />
        )}
        {block.type === "image" && (
          <div>
            {block.content ? (
              <div className="relative group/img">
                <img src={block.content} alt="" className="max-h-48 object-contain border border-noir-gray-2 w-full" />
                <div className="absolute inset-0 bg-noir-black/0 group-hover/img:bg-noir-black/20 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover/img:opacity-100">
                  <button onClick={() => imgRef.current?.click()} className="bg-white text-xs font-bold px-3 py-1">CAMBIAR</button>
                  <button onClick={() => onUpdate({ content: "", extra: "" })} className="bg-red-600 text-white text-xs font-bold px-3 py-1">QUITAR</button>
                </div>
              </div>
            ) : (
              <div onClick={() => imgRef.current?.click()}
                className="border-2 border-dashed border-noir-gray-2 p-8 text-center cursor-pointer hover:border-noir-black transition-colors">
                <Upload size={20} className="mx-auto text-noir-gray-4 mb-2" />
                <p className="text-xs text-noir-gray-4">Haz clic para subir una imagen</p>
              </div>
            )}
            <input ref={imgRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onImageFile(f); e.target.value = ""; }} />
          </div>
        )}
        {block.type === "video" && (
          <div className="space-y-2">
            <div onClick={() => videoRef.current?.click()}
              className="border-2 border-dashed border-noir-gray-2 p-5 text-center cursor-pointer hover:border-noir-black transition-colors">
              <Upload size={16} className="mx-auto text-noir-gray-4 mb-1" />
              <p className="text-xs text-noir-gray-4">{block.extra || "Subir video (MP4, MOV)"}</p>
            </div>
            <input ref={videoRef} type="file" accept="video/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onVideoFile(f); e.target.value = ""; }} />
            <input type="text" value={block.content} onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full border border-noir-gray-2 px-3 py-2 text-xs outline-none focus:border-noir-black font-mono transition-colors" />
          </div>
        )}
        {block.type === "button" && (
          <div className="flex gap-2">
            <input type="text" placeholder="Texto del botón" value={block.content} onChange={(e) => onUpdate({ content: e.target.value })}
              className="flex-1 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black transition-colors" />
            <input type="text" placeholder="/ruta o URL" value={block.extra ?? ""} onChange={(e) => onUpdate({ extra: e.target.value })}
              className="flex-1 border border-noir-gray-2 px-3 py-2 text-sm outline-none focus:border-noir-black font-mono transition-colors" />
          </div>
        )}
        {block.type === "divider" && <div className="py-2"><hr className="border-t-2 border-noir-gray-2" /><p className="text-[10px] text-noir-gray-4 mt-1">Línea divisora</p></div>}
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMove("up")} disabled={idx === 0} className="text-noir-gray-4 hover:text-noir-black disabled:opacity-20 transition-colors"><ChevronUp size={14} /></button>
        <button onClick={() => onMove("down")} disabled={idx === total - 1} className="text-noir-gray-4 hover:text-noir-black disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
        <button onClick={onRemove} className="text-noir-gray-4 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
      </div>
    </div>
  </div>
);
}