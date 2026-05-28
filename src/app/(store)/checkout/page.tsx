"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  CheckCircle,
  Scissors,
  ShoppingBag,
  Truck,
  Info,
  ChevronDown,
  ImageOff,
  Loader2,
  X,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import CityAutocomplete from "@/components/ui/CityAutocomplete";

/* ── Product image with graceful fallback ── */
function ProductImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  return (
    <div className="relative w-14 h-16 bg-[#e8e8e8] rounded flex-shrink-0 overflow-hidden border border-noir-gray-2">
      {status !== "error" ? (
        <Image
          src={src || ""}
          alt={alt}
          fill
          className={`object-cover transition-opacity duration-200 ${status === "ok" ? "opacity-100" : "opacity-0"}`}
          unoptimized
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      ) : null}
      {(status === "error" || !src) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-1">
          <ImageOff size={14} className="text-noir-gray-3" />
          <span className="text-[8px] text-noir-gray-3 text-center leading-tight line-clamp-2 font-medium">
            {alt}
          </span>
        </div>
      )}
      {status === "loading" && src && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-noir-gray-2 border-t-noir-gray-4 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

const BARBER_PRODUCT_ID = "barber-addon-001";

const DEPARTAMENTOS = [
  "Bogotá D.C.", "Antioquia", "Valle del Cauca", "Atlántico", "Cundinamarca",
  "Santander", "Bolívar", "Nariño", "Córdoba", "Tolima", "Boyacá", "Cauca",
  "Magdalena", "Sucre", "Huila", "Meta", "Risaralda", "Norte de Santander",
  "Quindío", "Caldas",
];

const DOC_TYPES = ["Cédula de ciudadanía", "NIT", "Pasaporte", "Cédula extranjería"];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WidgetCheckout: any;
  }
}

function loadWompiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.WidgetCheckout) return resolve();
    const existing = document.getElementById("wompi-widget-script");
    if (existing) { existing.addEventListener("load", () => resolve()); return; }
    const s = document.createElement("script");
    s.id = "wompi-widget-script";
    s.src = "https://checkout.wompi.co/widget.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("No se pudo cargar Wompi"));
    document.head.appendChild(s);
  });
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState("NL-000000-000");

  useEffect(() => {
    setMounted(true);
    setOrderNumber(`NL-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`);
    // preload Wompi
    loadWompiScript().catch(() => {});
  }, []);

  const hasBarberAddon = items.some((i) => i.productId === BARBER_PRODUCT_ID);
  const subtotal = totalPrice();
  const shipping = subtotal >= 250000 ? 0 : 12000;

  // Form state
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [docType, setDocType] = useState("Cédula de ciudadanía");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [cedula, setCedula] = useState("");
  const [direccion, setDireccion] = useState("");
  const [apto, setApto] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [departamento, setDepartamento] = useState("Bogotá D.C.");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [celular, setCelular] = useState("");
  const [saveInfo, setSaveInfo] = useState(false);

  // Coupon
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponType, setCouponType] = useState<string>("");
  const total = subtotal + shipping - discount;

  const applyCoupon = useCallback(async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const res = await fetch("/api/cupones/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), cartTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Cupón inválido");
        return;
      }
      setCouponCode(couponInput.trim().toUpperCase());
      setCouponApplied(true);
      setCouponType(data.coupon.type);
      setDiscount(Math.round(data.discount));
      const label =
        data.coupon.type === "PERCENTAGE"
          ? `${data.coupon.value}% de descuento aplicado`
          : data.coupon.type === "FREE_SHIPPING"
          ? "Envío gratis aplicado"
          : `${formatPrice(data.discount)} de descuento aplicado`;
      toast.success(`✓ ${label}`);
    } catch {
      toast.error("Error al verificar el cupón. Intenta de nuevo.");
    } finally {
      setCouponLoading(false);
    }
  }, [couponInput, subtotal]);

  const isValid = email && nombre && apellido && direccion && ciudad && celular;

  const openWompiCheckout = useCallback(async () => {
    if (!isValid) {
      toast.error("Por favor completa todos los campos requeridos.");
      return;
    }
    setLoading(true);
    try {
      await loadWompiScript();

      const sigRes = await fetch("/api/wompi/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: orderNumber, amountInCents: total * 100, currency: "COP" }),
      });
      if (!sigRes.ok) throw new Error("Error al generar firma");
      const { signature } = await sigRes.json();

      const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || "pub_test_IHkFOUYqjLbvxMz4K2sXwY0oSaMVTsml";

      const checkout = new window.WidgetCheckout({
        currency: "COP",
        amountInCents: total * 100,
        reference: orderNumber,
        publicKey,
        signature: { integrity: signature },
        redirectUrl: `${window.location.origin}/checkout?confirmed=1&ref=${orderNumber}`,
        customerData: {
          email,
          fullName: `${nombre} ${apellido}`.trim(),
          phoneNumber: celular,
          phoneNumberPrefix: "+57",
        },
        shippingAddress: {
          addressLine1: direccion,
          country: "CO",
          region: departamento,
          city: ciudad,
          name: `${nombre} ${apellido}`.trim(),
          phoneNumber: celular,
        },
      });

      setLoading(false);

      checkout.open(async (result: { transaction: { status: string; id: string } }) => {
        const { transaction } = result;
        if (transaction.status === "APPROVED") {
          await fetch("/api/ordenes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: items.map((i) => ({
                productId: i.productId, variantId: i.variantId,
                quantity: i.quantity, price: i.price,
                name: i.name, image: i.image, size: i.size,
              })),
              shippingAddress: { nombre: `${nombre} ${apellido}`, cedula, telefono: celular, direccion, apto, ciudad, departamento, codigoPostal },
              couponCode: couponCode || undefined,
              paymentMethod: "BANCOLOMBIA",
              email,
              paymentId: transaction.id,
            }),
          }).catch(() => {});
          clearCart();
          setConfirmed(true);
        } else if (transaction.status === "DECLINED") {
          toast.error("Pago declinado. Intenta con otro método.");
        } else {
          toast.error("Transacción pendiente. Revisa tu correo.");
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("No se pudo abrir el checkout. Intenta de nuevo.");
      setLoading(false);
    }
  }, [isValid, total, orderNumber, email, nombre, apellido, cedula, celular, direccion, apto, ciudad, departamento, codigoPostal, couponCode, items, clearCart]);

  // ── Empty cart
  if (mounted && items.length === 0 && !confirmed) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
        <div className="text-center">
          <ShoppingBag size={40} className="mx-auto mb-4 text-noir-gray-3" />
          <p className="text-sm text-noir-gray-4 mb-6">Tu carrito está vacío</p>
          <Link href="/tienda" className="bg-noir-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors inline-block">
            VER COLECCIÓN
          </Link>
        </div>
      </div>
    );
  }

  // ── Confirmación
  if (confirmed) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4 py-20">
        <div className="max-w-md w-full bg-white p-8 text-center">
          <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h1 className="text-xl font-black uppercase mb-2">¡PEDIDO CONFIRMADO!</h1>
          <p className="text-xs text-noir-gray-4 mb-1 uppercase tracking-widest">Número de pedido</p>
          <p className="text-lg font-black font-mono mb-4">{orderNumber}</p>
          <p className="text-sm text-noir-gray-4 mb-6">
            Enviamos la confirmación a <strong>{email}</strong>.<br />
            En 24 h recibirás el número de guía.
          </p>
          {hasBarberAddon && (
            <div className="bg-noir-black text-white p-5 mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Scissors size={13} />
                <p className="text-[10px] font-black tracking-widest uppercase">CORTE DE PELO INCLUIDO</p>
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                Presenta este pedido en Barber Brothers para canjear tu corte + Gel eGo. Solo en Bogotá, mínimo 3 prendas.
              </p>
              <a href="https://www.instagram.com/barberbrothers.co/" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold tracking-widest uppercase text-noir-gold hover:text-white transition-colors">
                @barberbrothers.co →
              </a>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link href="/tienda" className="bg-noir-black text-white py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors block text-center">
              SEGUIR COMPRANDO
            </Link>
            <Link href="/cuenta/pedidos" className="border border-noir-gray-2 py-3 text-xs font-bold tracking-widest uppercase hover:border-noir-black transition-colors block text-center">
              VER MIS PEDIDOS
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Top bar */}
      <div className="bg-white border-b border-noir-gray-2 px-6 py-4">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm font-black tracking-[0.1em] uppercase">NOIR LOVERS</Link>
          <div className="flex items-center gap-1.5 text-[10px] text-noir-gray-4">
            <Lock size={11} />
            <span className="font-medium uppercase tracking-widest">Pago seguro</span>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">

        {/* ══════════ LEFT — Forms ══════════ */}
        <div className="space-y-0">

          {/* ── Contacto */}
          <section className="bg-white px-6 pt-7 pb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">Contacto</h2>
              <Link href="/login" className="text-xs text-noir-gray-4 hover:text-noir-black underline underline-offset-2">
                Iniciar sesión
              </Link>
            </div>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white mb-3"
            />
            <label className="flex items-center gap-2 cursor-pointer mb-5">
              <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}
                className="w-4 h-4 border border-noir-gray-3 rounded accent-noir-black cursor-pointer" />
              <span className="text-xs text-noir-gray-4">Enviarme novedades y ofertas por correo electrónico, whatsapp o SMS.</span>
            </label>
            {/* Doc type */}
            <div className="relative">
              <select value={docType} onChange={(e) => setDocType(e.target.value)}
                className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white appearance-none">
                {DOC_TYPES.map((d) => <option key={d}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-4 pointer-events-none" />
            </div>
          </section>

          <div className="h-px bg-noir-gray-2" />

          {/* ── Entrega */}
          <section className="bg-white px-6 pt-7 pb-6">
            <h2 className="text-base font-bold mb-5">Entrega</h2>

            {/* Delivery type toggle */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button className="flex items-center justify-center gap-2 border-2 border-noir-black rounded py-3 text-xs font-bold">
                <Truck size={14} /> Envío
              </button>
              <button className="flex items-center justify-center gap-2 border border-noir-gray-2 rounded py-3 text-xs text-noir-gray-4 hover:border-noir-black transition-colors">
                <ShoppingBag size={14} /> Recogida en tienda
              </button>
            </div>

            {/* País */}
            <div className="relative mb-3">
              <select className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white appearance-none">
                <option>Colombia</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-4 pointer-events-none" />
            </div>

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                className="border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white" />
              <input type="text" value={apellido} onChange={(e) => setApellido(e.target.value)}
                placeholder="Apellidos"
                className="border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white" />
            </div>

            {/* Cédula */}
            <input type="text" value={cedula} onChange={(e) => setCedula(e.target.value)}
              placeholder="Cédula - NIT sin dígito de verificación"
              className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white mb-3" />

            {/* Dirección */}
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)}
              placeholder="Dirección"
              className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white mb-3" />

            {/* Apto/casa */}
            <input type="text" value={apto} onChange={(e) => setApto(e.target.value)}
              placeholder="Casa, apartamento, etc. (opcional)"
              className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white mb-3" />

            {/* Ciudad + Departamento + CP */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3 mb-3">
              <CityAutocomplete
                value={ciudad}
                onChange={(c, d) => {
                  setCiudad(c);
                  if (d) setDepartamento(d);
                }}
                placeholder="Ciudad o Municipio"
              />
              <div className="relative">
                <select value={departamento} onChange={(e) => setDepartamento(e.target.value)}
                  className="w-full border border-noir-gray-2 rounded px-3 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white appearance-none">
                  {DEPARTAMENTOS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-noir-gray-4 pointer-events-none" />
              </div>
            </div>
            <input type="text" value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)}
              placeholder="Código postal (opcional)"
              className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white mb-3" />

            {/* Celular */}
            <div className="relative mb-5">
              <input type="tel" value={celular} onChange={(e) => setCelular(e.target.value)}
                placeholder="Celular"
                className="w-full border border-noir-gray-2 rounded px-4 py-3 text-sm outline-none focus:border-noir-black transition-colors bg-white pr-9" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-gray-3">
                <Info size={15} />
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)}
                className="w-4 h-4 border border-noir-gray-3 rounded accent-noir-black cursor-pointer" />
              <span className="text-xs text-noir-gray-4">Guardar mi información y consultar más rápidamente la próxima vez</span>
            </label>
          </section>

          <div className="h-px bg-noir-gray-2" />

          {/* ── Métodos de envío */}
          <section className="bg-white px-6 pt-7 pb-6">
            <div className="flex items-start gap-2 bg-[#f5f5f5] rounded p-4 mb-5 text-xs text-noir-gray-4">
              <Info size={14} className="flex-shrink-0 mt-0.5" />
              <span>Verifica que la dirección de entrega, productos y tallas seleccionados estén correctos y completos.</span>
            </div>

            <h2 className="text-base font-bold mb-4">Métodos de envío</h2>

            <div className={`flex items-center justify-between border-2 rounded px-4 py-4 mb-3 ${
              shipping === 0 ? "border-noir-black" : "border-noir-gray-2"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  shipping === 0 ? "border-noir-black" : "border-noir-gray-3"
                }`}>
                  {shipping === 0 && <div className="w-2 h-2 rounded-full bg-noir-black" />}
                </div>
                <span className="text-sm font-medium">Costo de Envío</span>
              </div>
              <span className={`text-sm font-bold ${shipping === 0 ? "" : ""}`}>
                {shipping === 0 ? "GRATIS" : formatPrice(shipping)}
              </span>
            </div>

            {shipping > 0 && (
              <div className="flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50 rounded px-3 py-2 mb-3">
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <span>Agrega <strong>{formatPrice(250000 - subtotal)}</strong> más para envío gratis</span>
              </div>
            )}

            {/* Shipping info */}
            <div className="border border-noir-gray-2 rounded p-4 text-xs text-noir-gray-4 leading-relaxed space-y-1.5">
              <div className="flex items-start gap-2">
                <Info size={12} className="flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p>Bogotá mismo día (antes 3pm) o siguiente día hábil.*</p>
                  <p>Ciudades principales 2-5 días hábiles.*</p>
                  <p>Resto del país 4-7 días hábiles.*</p>
                </div>
              </div>
              <ul className="ml-4 mt-2 space-y-1 list-disc">
                <li>Derecho de retracto de 5 días hábiles</li>
                <li>3 días adicionales para devoluciones (sin usar, con etiquetas)*.</li>
                <li>45 días para cambios de prendas nuevas*.</li>
                <li>90 días para garantías*.</li>
              </ul>
              <p className="text-[10px] mt-2">*Aplican TyC.</p>
            </div>
          </section>

          <div className="h-px bg-noir-gray-2" />

          {/* ── Pago */}
          <section className="bg-white px-6 pt-7 pb-7">
            <h2 className="text-base font-bold mb-1">Pago</h2>
            <p className="text-xs text-noir-gray-4 mb-5">Todas las transacciones son seguras y están encriptadas.</p>

            {/* Wompi methods */}
            <div className="border-2 border-noir-black rounded overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3.5 bg-[#f9f9f9]">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-noir-black flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-noir-black" />
                  </div>
                  <span className="text-sm font-medium">Pagar con Wompi</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {["VISA", "MC", "AMEX", "NEQUI", "PSE"].map((b) => (
                    <span key={b} className="text-[8px] font-black border border-noir-gray-2 px-1.5 py-0.5 rounded text-noir-gray-4 bg-white">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-4 border-t border-noir-gray-2 bg-white">
                <p className="text-xs text-noir-gray-4 leading-relaxed">
                  Al hacer clic en <strong className="text-noir-black">Completar pedido</strong> se abrirá el modal
                  seguro de <strong className="text-noir-black">Wompi (Bancolombia)</strong> donde podrás pagar con
                  tarjeta, Nequi, PSE, QR o DaviPlata.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {[
                    { icon: "🏦", label: "Bancolombia" },
                    { icon: "💜", label: "Nequi" },
                    { icon: "📷", label: "QR" },
                    { icon: "🏛️", label: "PSE" },
                    { icon: "💳", label: "Tarjeta" },
                    { icon: "📱", label: "DaviPlata" },
                  ].map((m) => (
                    <span key={m.label} className="flex items-center gap-1 text-[10px] bg-[#f5f5f5] px-2 py-1 rounded text-noir-gray-4 border border-noir-gray-2">
                      {m.icon} {m.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Barber addon promo */}
            {hasBarberAddon && (
              <div className="bg-noir-black text-white rounded p-5 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Scissors size={14} />
                  <p className="text-[10px] font-black tracking-widest uppercase">CORTE DE PELO INCLUIDO</p>
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  Incluye un corte de pelo + Gel eGo en Barber Brothers. Válido en Bogotá, mínimo 3 prendas NOIR LOVERS.
                </p>
                <a href="https://www.instagram.com/barberbrothers.co/" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-[10px] font-bold uppercase tracking-widest text-noir-gold hover:text-white transition-colors">
                  @barberbrothers.co →
                </a>
              </div>
            )}

            {/* Security note */}
            <div className="flex items-start gap-2 text-[10px] text-noir-gray-4 mb-6">
              <Lock size={11} className="flex-shrink-0 mt-0.5" />
              <span>Tus datos están protegidos con cifrado SSL. Nunca almacenamos información de pago.</span>
            </div>

            {/* CTA */}
            <button
              onClick={openWompiCheckout}
              disabled={loading || !isValid}
              className="w-full bg-noir-black text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded"
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                  CARGANDO...
                </>
              ) : (
                <>
                  <Lock size={14} />
                  COMPLETAR PEDIDO · {formatPrice(total)}
                </>
              )}
            </button>

            {!isValid && (
              <p className="text-[10px] text-center text-amber-600 mt-2">
                Completa todos los campos requeridos para continuar
              </p>
            )}
          </section>
        </div>

        {/* ══════════ RIGHT — Order summary ══════════ */}
        <aside className="sticky top-6 space-y-0">
          <div className="bg-[#f0f0f0] rounded-t overflow-hidden">

            {/* Items */}
            <div className="px-5 py-5 space-y-4 max-h-80 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    {item.productId === BARBER_PRODUCT_ID ? (
                      <div className="w-14 h-16 bg-noir-black rounded flex items-center justify-center border border-noir-gray-2">
                        <Scissors size={16} className="text-white" />
                      </div>
                    ) : (
                      <ProductImage src={item.image} alt={item.name} />
                    )}
                    <span className="absolute -top-2 -right-2 min-w-[20px] h-[20px] bg-noir-black text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-[#f0f0f0]">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-snug line-clamp-2">{item.name}</p>
                    {item.size && <p className="text-[10px] text-noir-gray-4 mt-0.5">{item.size}</p>}
                  </div>
                  <span className="text-xs font-bold flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="px-5 pb-4 flex gap-2">
              <input
                type="text" value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && !couponApplied && applyCoupon()}
                placeholder="Código de descuento o tarjeta de regalo"
                disabled={couponApplied || couponLoading}
                className="flex-1 border border-noir-gray-2 bg-white rounded px-3 py-2.5 text-xs outline-none focus:border-noir-black transition-colors disabled:bg-[#f5f5f5] disabled:text-noir-gray-4 font-mono tracking-widest"
              />
              <button
                onClick={applyCoupon}
                disabled={couponApplied || !couponInput || couponLoading}
                className="border border-noir-gray-2 bg-white rounded px-4 py-2.5 text-xs font-bold uppercase hover:border-noir-black transition-colors disabled:opacity-40 whitespace-nowrap flex items-center gap-1.5 min-w-[80px] justify-center"
              >
                {couponLoading ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : couponApplied ? (
                  "✓ OK"
                ) : (
                  "Aplicar"
                )}
              </button>
            </div>
            {couponApplied && (
              <div className="px-5 pb-3 flex items-center justify-between">
                <p className="text-[10px] text-green-600 font-bold">
                  ✓ {couponCode}
                  {couponType === "PERCENTAGE" && ` — descuento de -${formatPrice(discount)}`}
                  {couponType === "FIXED" && ` — ${formatPrice(discount)} de descuento`}
                  {couponType === "FREE_SHIPPING" && ` — envío gratis`}
                </p>
                <button
                  onClick={() => {
                    setCouponApplied(false);
                    setCouponCode("");
                    setCouponInput("");
                    setDiscount(0);
                    setCouponType("");
                  }}
                  className="text-noir-gray-3 hover:text-noir-black transition-colors ml-2"
                  title="Eliminar cupón"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Pricing */}
            <div className="px-5 py-4 border-t border-noir-gray-2 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-noir-gray-4">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1 text-noir-gray-4">
                  <span>Envío</span>
                  <Info size={11} className="text-noir-gray-3" />
                </div>
                <span className={`font-medium ${shipping === 0 ? "text-green-600" : ""}`}>
                  {shipping === 0 ? "GRATIS" : formatPrice(shipping)}
                </span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="px-5 py-4 border-t border-noir-gray-2 flex justify-between items-center">
              <div>
                <span className="text-base font-bold">Total</span>
                <p className="text-[10px] text-noir-gray-4 mt-0.5">COP · Incluye impuestos</p>
              </div>
              <span className="text-xl font-black">{formatPrice(total)}</span>
            </div>

            {/* Trust badges */}
            <div className="px-5 py-4 border-t border-noir-gray-2 flex flex-wrap gap-1.5">
              {["Wompi", "Bancolombia", "PSE", "Nequi", "Visa", "Mastercard"].map((b) => (
                <span key={b} className="text-[8px] font-bold bg-white border border-noir-gray-2 px-2 py-1 text-noir-gray-4 uppercase tracking-wide rounded">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
