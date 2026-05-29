import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
title: "Filosofía — NOIR LOVERS",
description: "El negro lo es todo. La postura de NOIR LOVERS frente al mundo.",
};

async function getFilosofia() {
try {
  const setting = await prisma.siteSetting.findUnique({
    where: { section_key: { section: "pages", key: "filosofia" } },
  });
  if (!setting) return null;
  const d = JSON.parse(setting.value);

  // Si ya viene en formato anidado, retorna directo
  if (d.hero) return d;

  // Transforma formato plano del admin → formato anidado de la página
  return {
    hero: {
      titulo:      d.heroHeadline  ?? "EL NEGRO\nLO ES TODO.",
      ciudadLabel: d.heroLocation  ?? "BOGOTÁ, COLOMBIA",
      imagen:      d.heroImage     ?? "",
    },
    intro: {
      etiquetaSuperior: d.introLabel ?? "NUESTRA POSTURA",
      tituloPrincipal:  d.introTitle ?? "No es un color. No es una tendencia.\nEs una forma de estar en el mundo.",
      parrafo:          d.introBody  ?? "",
    },
    identidad: {
      etiqueta: d.splitLabel  ?? "IDENTIDAD",
      titulo:   d.splitTitle  ?? "CONSTRUIDO\nDESDE ADENTRO.",
      parrafo1: d.splitPara1  ?? "",
      parrafo2: d.splitPara2  ?? "",
      imagen:   d.splitImage  ?? "",
    },
    manifiesto: {
      cita:       d.manifestoQuote  ?? "",
      atribucion: d.manifestoAuthor ?? "FUNDADORES DE NOIR LOVERS",
    },
    pilares: {
      etiqueta: d.pilaresLabel ?? "LOS TRES PILARES",
      items: [
        { numero: "01", titulo: d.pilar1Title ?? "INTENCIÓN",    texto: d.pilar1Text ?? "" },
        { numero: "02", titulo: d.pilar2Title ?? "CONSTRUCCIÓN", texto: d.pilar2Text ?? "" },
        { numero: "03", titulo: d.pilar3Title ?? "ACTITUD",      texto: d.pilar3Text ?? "" },
      ],
    },
    bannerOscuridad: {
      etiqueta: d.bannerLabel    ?? "COLECCIÓN NOIR",
      titulo:   d.bannerHeadline ?? "VISTE LA\nOSCURIDAD.",
      imagen:   d.bannerImage    ?? "",
    },
    ctaFinal: {
      etiquetaSuperior: d.ctaLabel    ?? "ÚNETE AL MOVIMIENTO",
      titulo:           d.ctaTitle    ?? "EMPIEZA CON\nEL NEGRO.",
      boton1Texto:      d.ctaBtn1Text ?? "VER COLECCIÓN",
      boton1Link:       d.ctaBtn1Link ?? "/tienda",
      boton2Texto:      d.ctaBtn2Text ?? "NUESTRA HISTORIA",
      boton2Link:       d.ctaBtn2Link ?? "/nosotros",
    },
  };
} catch {
  return null;
}
}

export default async function FilosofiaPage() {
const d = await getFilosofia();

const hero = d?.hero ?? { titulo: "EL NEGRO\nLO ES TODO.", ciudadLabel: "BOGOTÁ, COLOMBIA", imagen: "" };
const intro = d?.intro ?? {
  etiquetaSuperior: "NUESTRA POSTURA",
  tituloPrincipal: "No es un color. No es una tendencia.\nEs una forma de estar en el mundo.",
  parrafo: "NOIR LOVERS nació en Bogotá para los hombres que entienden que el negro no necesita justificación. Una identidad construida desde adentro, traducida en cada corte, cada tela, cada detalle.",
};
const identidad = d?.identidad ?? {
  etiqueta: "IDENTIDAD",
  titulo: "CONSTRUIDO\nDESDE ADENTRO.",
  parrafo1: "Cada prenda tiene un propósito. No diseñamos para el trend. Diseñamos para el hombre que sabe exactamente quién es y no necesita explicarlo.",
  parrafo2: "Materiales premium, cortes colombianos, acabados que duran. Calidad sin excusas, desde las calles de Bogotá hacia el mundo.",
  imagen: "",
};
const manifiesto = d?.manifiesto ?? {
  cita: "El negro lo contiene todo. El silencio, la fuerza, la elegancia. No necesita nada más.",
  atribucion: "FUNDADORES DE NOIR LOVERS",
};
const pilares = d?.pilares ?? {
  etiqueta: "LOS TRES PILARES",
  items: [
    { numero: "01", titulo: "INTENCIÓN", texto: "Cada prenda tiene un propósito. Diseñamos para el hombre que sabe quién es, no para el que sigue tendencias." },
    { numero: "02", titulo: "CONSTRUCCIÓN", texto: "Materiales premium, cortes colombianos, acabados que duran. Calidad sin excusas, desde Bogotá." },
    { numero: "03", titulo: "ACTITUD", texto: "NOIR LOVERS no es ropa. Es la forma en que entras a un cuarto. La presencia que no necesita explicación." },
  ],
};
const banner = d?.bannerOscuridad ?? { etiqueta: "COLECCIÓN NOIR", titulo: "VISTE LA\nOSCURIDAD.", imagen: "" };
const cta = d?.ctaFinal ?? {
  etiquetaSuperior: "ÚNETE AL MOVIMIENTO",
  titulo: "EMPIEZA CON\nEL NEGRO.",
  boton1Texto: "VER COLECCIÓN", boton1Link: "/tienda",
  boton2Texto: "NUESTRA HISTORIA", boton2Link: "/nosotros",
};

return (
  <div className="bg-noir-white">
    {/* Hero */}
    <div className="relative h-[90vh] bg-noir-black overflow-hidden">
      <Image
        src={hero.imagen || "/hero-main.jpg"}
        alt="NOIR LOVERS Filosofía"
        fill className="object-cover object-top opacity-60" priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-noir-black/20 via-transparent to-noir-black/70" />
      <div className="absolute top-12 left-0 right-0 flex justify-center">
        <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/50">FILOSOFÍA</p>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
        <h1 className="text-[clamp(52px,9vw,120px)] font-black uppercase leading-[0.92] tracking-tight">
          {hero.titulo.split("\n").map((line: string, i: number) => (
            <span key={i}>{line}{i < hero.titulo.split("\n").length - 1 && <br />}</span>
          ))}
        </h1>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <p className="text-[11px] text-white/40 tracking-widest uppercase">{hero.ciudadLabel}</p>
      </div>
    </div>

    {/* Intro */}
    <div className="max-w-screen-md mx-auto px-6 py-24 text-center">
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-6">{intro.etiquetaSuperior}</p>
      <p className="text-2xl md:text-[34px] font-black leading-[1.2] tracking-tight">
        {intro.tituloPrincipal.split("\n").map((line: string, i: number) => (
          <span key={i}>{line}{i < intro.tituloPrincipal.split("\n").length - 1 && <br />}</span>
        ))}
      </p>
      <p className="mt-8 text-sm text-noir-gray-4 leading-[1.9] max-w-lg mx-auto">{intro.parrafo}</p>
    </div>

    {/* Identidad */}
    <div className="grid md:grid-cols-2 max-w-screen-xl mx-auto px-6 gap-12 pb-24 items-center">
      <div className="relative aspect-[3/4] overflow-hidden bg-noir-gray">
        <Image src={identidad.imagen || "/tshirt-model.png"} alt="NOIR LOVERS — Identidad"
          fill className="object-cover object-top" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="py-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-5">{identidad.etiqueta}</p>
        <h2 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight mb-8">
          {identidad.titulo.split("\n").map((line: string, i: number) => (
            <span key={i}>{line}{i < identidad.titulo.split("\n").length - 1 && <br />}</span>
          ))}
        </h2>
        <div className="space-y-5 text-sm text-noir-gray-4 leading-[1.9]">
          <p>{identidad.parrafo1}</p>
          <p>{identidad.parrafo2}</p>
        </div>
      </div>
    </div>

    {/* Manifiesto */}
    <div className="bg-noir-black text-white py-28 px-6 text-center">
      <p className="text-[10px] font-bold tracking-[0.5em] uppercase text-white/30 mb-8">MANIFIESTO</p>
      <blockquote className="text-3xl md:text-[52px] font-black leading-[1.1] tracking-tight max-w-4xl mx-auto">
        "{manifiesto.cita}"
      </blockquote>
      <p className="mt-10 text-white/30 text-[10px] tracking-[0.4em] uppercase">— {manifiesto.atribucion}</p>
    </div>

    {/* Pilares */}
    <div className="max-w-screen-xl mx-auto px-6 py-24">
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 text-center mb-14">{pilares.etiqueta}</p>
      <div className="grid md:grid-cols-3 gap-10">
        {pilares.items.map((p: { numero: string; titulo: string; texto: string }) => (
          <div key={p.numero} className="border-t-2 border-noir-black pt-8">
            <span className="text-[10px] font-bold tracking-widest text-noir-gray-4">{p.numero}</span>
            <h3 className="text-xl font-black uppercase mt-3 mb-4">{p.titulo}</h3>
            <p className="text-sm text-noir-gray-4 leading-[1.8]">{p.texto}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Banner oscuridad */}
    <div className="relative h-[60vh] overflow-hidden bg-noir-gray">
      <Image src={banner.imagen || "/banner-collection-1.webp"} alt="NOIR LOVERS colección"
        fill className="object-cover object-center" sizes="100vw" />
      <div className="absolute inset-0 bg-noir-black/40" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
        <p className="text-[10px] tracking-[0.5em] uppercase text-white/50 mb-4">{banner.etiqueta}</p>
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none">
          {banner.titulo.split("\n").map((line: string, i: number) => (
            <span key={i}>{line}{i < banner.titulo.split("\n").length - 1 && <br />}</span>
          ))}
        </h2>
      </div>
    </div>

    {/* CTA */}
    <div className="py-24 text-center px-6">
      <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-noir-gray-4 mb-5">{cta.etiquetaSuperior}</p>
      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-none mb-10">
        {cta.titulo.split("\n").map((line: string, i: number) => (
          <span key={i}>{line}{i < cta.titulo.split("\n").length - 1 && <br />}</span>
        ))}
      </h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={cta.boton1Link} className="inline-block bg-noir-black text-white text-[11px] font-bold tracking-widest uppercase px-12 py-4 hover:opacity-80 transition-opacity">
          {cta.boton1Texto}
        </Link>
        <Link href={cta.boton2Link} className="inline-block border border-noir-black text-noir-black text-[11px] font-bold tracking-widest uppercase px-12 py-4 hover:bg-noir-black hover:text-white transition-colors">
          {cta.boton2Texto}
        </Link>
      </div>
    </div>
  </div>
);
}