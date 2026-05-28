import Link from "next/link";
import Image from "next/image";

const col1 = [
  { label: "Home", href: "/" },
  { label: "Colección", href: "/tienda" },
  { label: "Total Looks", href: "/total-looks" },
  { label: "Camisetas", href: "/categoria/camisetas" },
  { label: "Pantalones", href: "/categoria/pantalones" },
  { label: "Hoodies", href: "/categoria/hoodies" },
  { label: "Chaquetas", href: "/categoria/chaquetas" },
];

const col2 = [
  { label: "Envíos y devoluciones", href: "/envios" },
  { label: "Guía de tallas", href: "/tallas" },
  { label: "Preguntas frecuentes", href: "/faq" },
  { label: "Contacto", href: "/contacto" },
  { label: "Privacidad", href: "/privacidad" },
];

export default function Footer() {
  return (
    <footer className="bg-noir-black text-white">
      <div className="max-w-screen-xl mx-auto px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/logo.svg"
                alt="NOIR LOVERS"
                width={140}
                height={20}
                className="brightness-0 invert"
                style={{ height: "auto" }}
              />
            </Link>
            <p className="text-xs text-white/40 leading-relaxed max-w-[220px]">
              Moda masculina oscura. Para hombres que saben lo que quieren.
              Bogotá, Colombia.
            </p>
          </div>

          {/* Tienda */}
          <div>
            <ul className="space-y-[10px]">
              {col1.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ayuda */}
          <div>
            <ul className="space-y-[10px]">
              {col2.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-xs text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/[0.08] text-center">
          <p className="text-[10px] text-white/25 tracking-widest">
            NOIR LOVERS © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
