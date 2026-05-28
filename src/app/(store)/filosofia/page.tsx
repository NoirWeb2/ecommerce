import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Filosofía — NOIR LOVERS",
  description: "El negro lo es todo. La postura de NOIR LOVERS frente al mundo.",
};

export default function FilosofiaPage() {
  return (
    <div className="bg-noir-white">
      {/* ── Hero full-bleed ── */}
      <div className="relative h-[90vh] bg-noir-black overflow-hidden">
        <Image
          src="/hero-main.jpg"
          alt="NOIR LOVERS Filosofía"
          fill
          className="object-cover object-top opacity-60"
          priority
        />
        {/* gradient bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-noir-black/20 via-transparent to-noir-black/70" />

        {/* label top */}
        <div className="absolute top-12 left-0 right-0 flex justify-center">
          <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/50">
            FILOSOFÍA
          </p>
        </div>

        {/* headline centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <h1 className="text-[clamp(52px,9vw,120px)] font-black uppercase leading-[0.92] tracking-tight">
            EL NEGRO
            <br />
            LO ES TODO.
          </h1>
        </div>

        {/* bottom label */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center">
          <p className="text-[11px] text-white/40 tracking-widest uppercase">
            BOGOTÁ, COLOMBIA
          </p>
        </div>
      </div>

      {/* ── Intro text ── */}
      <div className="max-w-screen-md mx-auto px-6 py-24 text-center">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-6">
          NUESTRA POSTURA
        </p>
        <p className="text-2xl md:text-[34px] font-black leading-[1.2] tracking-tight">
          No es un color. No es una tendencia.
          <br />
          Es una forma de estar en el mundo.
        </p>
        <p className="mt-8 text-sm text-noir-gray-4 leading-[1.9] max-w-lg mx-auto">
          NOIR LOVERS nació en Bogotá para los hombres que entienden que el negro
          no necesita justificación. Una identidad construida desde adentro,
          traducida en cada corte, cada tela, cada detalle.
        </p>
      </div>

      {/* ── Split section: image left / text right ── */}
      <div className="grid md:grid-cols-2 max-w-screen-xl mx-auto px-6 gap-12 pb-24 items-center">
        <div className="relative aspect-[3/4] overflow-hidden bg-noir-gray">
          <Image
            src="/tshirt-model.png"
            alt="NOIR LOVERS — Identidad"
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="py-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-5">
            IDENTIDAD
          </p>
          <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight mb-8">
            CONSTRUIDO
            <br />
            DESDE ADENTRO.
          </h2>
          <div className="space-y-5 text-sm text-noir-gray-4 leading-[1.9]">
            <p>
              Cada prenda tiene un propósito. No diseñamos para el trend.
              Diseñamos para el hombre que sabe exactamente quién es y no
              necesita explicarlo.
            </p>
            <p>
              Materiales premium, cortes colombianos, acabados que duran.
              Calidad sin excusas, desde las calles de Bogotá hacia el mundo.
            </p>
          </div>
        </div>
      </div>

      {/* ── Pull quote ── */}
      <div className="bg-noir-black text-white py-28 px-6 text-center">
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/30 mb-8">
          MANIFIESTO
        </p>
        <blockquote className="text-3xl md:text-[52px] font-black leading-[1.1] tracking-tight max-w-4xl mx-auto">
          "El negro lo contiene todo. El silencio,
          <br className="hidden md:block" />
          la fuerza, la elegancia. No necesita nada más."
        </blockquote>
        <p className="mt-10 text-white/30 text-[10px] tracking-[0.4em] uppercase">
          — FUNDADORES DE NOIR LOVERS
        </p>
      </div>

      {/* ── Three pillars ── */}
      <div className="max-w-screen-xl mx-auto px-6 py-24">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 text-center mb-14">
          LOS TRES PILARES
        </p>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              num: "01",
              title: "INTENCIÓN",
              text: "Cada prenda tiene un propósito. Diseñamos para el hombre que sabe quién es, no para el que sigue tendencias.",
            },
            {
              num: "02",
              title: "CONSTRUCCIÓN",
              text: "Materiales premium, cortes colombianos, acabados que duran. Calidad sin excusas, desde Bogotá.",
            },
            {
              num: "03",
              title: "ACTITUD",
              text: "NOIR LOVERS no es ropa. Es la forma en que entras a un cuarto. La presencia que no necesita explicación.",
            },
          ].map((p) => (
            <div key={p.num} className="border-t-2 border-noir-black pt-8">
              <span className="text-[10px] font-bold tracking-widest text-noir-gray-4">
                {p.num}
              </span>
              <h3 className="text-xl font-black uppercase mt-3 mb-4">{p.title}</h3>
              <p className="text-sm text-noir-gray-4 leading-[1.8]">{p.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Banner image (second product shot) ── */}
      <div className="relative h-[60vh] overflow-hidden bg-noir-gray">
        <Image
          src="/banner-collection-1.webp"
          alt="NOIR LOVERS colección"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-noir-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/50 mb-4">
            COLECCIÓN NOIR
          </p>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
            VISTE LA
            <br />
            OSCURIDAD.
          </h2>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="py-24 text-center px-6">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-5">
          ÚNETE AL MOVIMIENTO
        </p>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-10">
          EMPIEZA CON
          <br />
          EL NEGRO.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/tienda"
            className="inline-block bg-noir-black text-white text-[11px] font-bold tracking-widest uppercase px-12 py-4 hover:opacity-80 transition-opacity"
          >
            VER COLECCIÓN
          </Link>
          <Link
            href="/nosotros"
            className="inline-block border border-noir-black text-noir-black text-[11px] font-bold tracking-widest uppercase px-12 py-4 hover:bg-noir-black hover:text-white transition-colors"
          >
            NUESTRA HISTORIA
          </Link>
        </div>
      </div>
    </div>
  );
}
