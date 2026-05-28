import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nosotros — NOIR LOVERS",
  description: "La primera marca colombiana de moda masculina especializada 100% en negro. Bogotá, 2022.",
};

const values = [
  { number: "01", title: "Solo negro.", text: "No tienes que explicar por qué amas la ropa negra. Somos la misma gente, cada prenda que diseñamos lo demuestra." },
  { number: "02", title: "Corte colombiano.", text: "Diseñamos para el cuerpo del hombre latinoamericano. Talla hecha aquí, para quienes viven aquí." },
  { number: "03", title: "Calidad sin excusas.", text: "Trabajamos solo con las mejores telas en Bogotá. Cada prenda nació aquí, está elaborada con cuidado al detalle." },
  { number: "04", title: "Estilo de vida.", text: "NOIR LOVERS no es solo ropa, es lo que eres. Es la forma en que entras a un lugar. La actitud que no necesita justificarse." },
];

export default function NosotrosPage() {
  return (
    <div>
      {/* Hero */}
      <div className="max-w-screen-xl mx-auto px-6 pt-12">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">NOSOTROS</h1>
      </div>

      {/* Big image with headline */}
      <div className="relative h-[60vh] mt-6 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=1600&q=90"
          alt="Noir Lovers — No es una marca. Es una decisión."
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-noir-black/50" />
        <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-16">
          <p className="text-white/50 text-xs tracking-widest uppercase mb-4">BOGOTÁ, COLOMBIA · 2022</p>
          <h2 className="text-white text-4xl md:text-6xl font-black uppercase leading-tight tracking-tight">
            NO ES UNA MARCA.
            <br />
            ES UNA DECISIÓN.
          </h2>
          <p className="text-white/70 text-sm mt-4 max-w-sm">
            NOIR LOVERS nació de una obsesión simple: la ropa negra es la forma más honesta de vestirse.
          </p>
        </div>
      </div>

      {/* Story + Photo */}
      <div className="max-w-screen-xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-start">
        <div>
          <p className="text-xs font-bold tracking-widest uppercase text-noir-gray-4 mb-6">NUESTRA HISTORIA</p>
          <p className="text-sm leading-relaxed text-noir-gray-4 mb-4">
            Todo empezó con una pregunta: ¿por qué no existe una marca colombiana que haga solo ropa negra, bien hecha, para hombres que saben lo que quieren?
          </p>
          <p className="text-sm leading-relaxed text-noir-gray-4 mb-4">
            No encontramos la respuesta. La construimos. NOIR LOVERS nació en Bogotá en 2022 con un catálogo de tres prendas y la convicción de que el negro no es un color — es una actitud.
          </p>
          <p className="text-sm leading-relaxed text-noir-gray-4 mb-8">
            Hoy somos la primera marca de moda masculina en Colombia especializada al 100% en negro. Cada prenda es diseñada aquí, pensada para el hombre latinoamericano que prefiere hablar con su presencia, no con sus colores.
          </p>
          <blockquote className="border-l-2 border-noir-black pl-6 py-2">
            <p className="text-lg font-black italic leading-snug">
              "El negro lo contiene todo. El silencio, la fuerza, la elegancia. No necesita nada más."
            </p>
            <cite className="text-xs text-noir-gray-4 mt-3 block tracking-widest uppercase not-italic">
              — FUNDADORES DE NOIR LOVERS
            </cite>
          </blockquote>
        </div>
        <div className="relative aspect-[3/4] overflow-hidden bg-noir-gray">
          <Image
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=90"
            alt="Founder"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Values */}
      <div className="bg-noir-black text-white py-20">
        <div className="max-w-screen-xl mx-auto px-6">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/40 text-center mb-12">
            LO QUE NOS MUEVE
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {values.map((v) => (
              <div key={v.number}>
                <span className="text-2xl font-black text-white/20">{v.number}</span>
                <h3 className="text-lg font-black mt-2 mb-3">{v.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 text-center px-6">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
          ÚNETE A LA
          <br />
          COMUNIDAD.
        </h2>
        <p className="text-noir-gray-4 text-sm mt-4 max-w-sm mx-auto">
          Regístrate y recibe acceso anticipado a nuevas colecciones y descuentos exclusivos.
        </p>
        <div className="flex gap-4 justify-center mt-8 flex-wrap">
          <Link href="/registro" className="bg-noir-black text-white px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-noir-black/90 transition-colors">
            CREAR CUENTA
          </Link>
          <Link href="/tienda" className="border border-noir-black px-8 py-4 text-xs font-bold tracking-widest uppercase hover:bg-noir-black hover:text-white transition-colors">
            VER COLECCIÓN
          </Link>
        </div>
      </div>
    </div>
  );
}
