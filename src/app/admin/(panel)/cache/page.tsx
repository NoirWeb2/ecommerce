"use client";

import { useState } from "react";
import { Trash2, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface CacheItem {
  key: string;
  label: string;
  description: string;
  size: string;
  lastCleared: string | null;
}

const CACHE_ITEMS: CacheItem[] = [
  { key: "pages", label: "Páginas del home", description: "Caché de Next.js para las páginas del front (ISR)", size: "~2.4 MB", lastCleared: null },
  { key: "products", label: "Catálogo de productos", description: "Productos, categorías y colecciones cacheados", size: "~800 KB", lastCleared: null },
  { key: "images", label: "Imágenes optimizadas", description: "Next/Image caché de imágenes procesadas", size: "~45 MB", lastCleared: null },
  { key: "api", label: "Respuestas de API", description: "Respuestas cacheadas de endpoints de productos", size: "~320 KB", lastCleared: null },
  { key: "cdn", label: "CDN / Cloudinary", description: "Transformaciones de imágenes en Cloudinary", size: "Variable", lastCleared: null },
];

export default function CachePage() {
  const [items, setItems] = useState<CacheItem[]>(CACHE_ITEMS);
  const [clearing, setClearing] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  const clearCache = (key: string) => {
    setClearing(key);
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.key === key
            ? { ...item, lastCleared: new Date().toLocaleTimeString("es-CO") }
            : item
        )
      );
      setClearing(null);
      toast.success(`Caché de "${CACHE_ITEMS.find((i) => i.key === key)?.label}" limpiada`);
    }, 1200);
  };

  const clearAll = () => {
    setConfirmAll(false);
    setClearing("all");
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) => ({ ...item, lastCleared: new Date().toLocaleTimeString("es-CO") }))
      );
      setClearing(null);
      toast.success("Toda la caché del sitio fue limpiada");
    }, 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black uppercase">CACHÉ</h1>
          <p className="text-xs text-noir-gray-4 mt-0.5">Limpia la caché del sitio para reflejar cambios inmediatamente.</p>
        </div>
        <button
          onClick={() => setConfirmAll(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors"
        >
          <Trash2 size={14} /> LIMPIAR TODO
        </button>
      </div>

      {/* Status banner */}
      {clearing === "all" && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 p-4 mb-4">
          <RefreshCw size={16} className="text-amber-600 animate-spin" />
          <p className="text-xs font-medium text-amber-800">Limpiando toda la caché del sitio…</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="bg-white border border-noir-gray-2 p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-bold">{item.label}</p>
                <span className="text-[9px] font-bold tracking-widest uppercase bg-noir-gray px-1.5 py-0.5 text-noir-gray-4">
                  {item.size}
                </span>
              </div>
              <p className="text-xs text-noir-gray-4">{item.description}</p>
              {item.lastCleared && (
                <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                  <Check size={10} /> Limpiada hoy a las {item.lastCleared}
                </p>
              )}
            </div>
            <button
              onClick={() => clearCache(item.key)}
              disabled={clearing === item.key || clearing === "all"}
              className="flex items-center gap-2 border border-noir-gray-2 px-4 py-2 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              {clearing === item.key ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              {clearing === item.key ? "LIMPIANDO…" : "LIMPIAR"}
            </button>
          </div>
        ))}
      </div>

      {/* Info block */}
      <div className="mt-6 border border-noir-gray-2 bg-noir-gray p-5">
        <h3 className="text-xs font-black uppercase tracking-widest mb-2">¿Cuándo limpiar la caché?</h3>
        <ul className="space-y-1.5 text-xs text-noir-gray-4">
          <li>• Después de actualizar productos, precios o imágenes</li>
          <li>• Después de cambiar textos o banners desde Páginas</li>
          <li>• Cuando los cambios no se reflejan en la tienda</li>
          <li>• Después de publicar una nueva colección</li>
        </ul>
      </div>

      {/* Confirm all modal */}
      {confirmAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-noir-black/50" onClick={() => setConfirmAll(false)} />
          <div className="relative bg-white w-full max-w-sm p-6 text-center">
            <AlertTriangle size={32} className="text-amber-500 mx-auto mb-3" />
            <h2 className="text-sm font-black uppercase mb-2">¿LIMPIAR TODA LA CACHÉ?</h2>
            <p className="text-xs text-noir-gray-4 mb-6">
              El sitio puede tardar unos segundos más en cargar mientras se reconstruye la caché.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={clearAll}
                className="bg-red-600 text-white px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:bg-red-700 transition-colors"
              >
                SÍ, LIMPIAR TODO
              </button>
              <button
                onClick={() => setConfirmAll(false)}
                className="border border-noir-gray-2 px-6 py-2.5 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors"
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
