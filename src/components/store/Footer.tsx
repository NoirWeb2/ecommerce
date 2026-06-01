import Link from "next/link";
import Image from "next/image";

interface NavLink { label: string; href: string }
interface FooterData {
tagline?: string;
col1Title?: string;
col2Title?: string;
col1Links?: NavLink[];
col2Links?: NavLink[];
socialInstagram?: string;
socialTikTok?: string;
socialWhatsApp?: string;
}

// ── Defaults hardcodeados como fallback ──
const DEFAULT_COL1: NavLink[] = [
{ label: "Home", href: "/" },
{ label: "Colección", href: "/tienda" },
{ label: "Total Looks", href: "/total-looks" },
{ label: "Camisetas", href: "/categoria/camisetas" },
{ label: "Pantalones", href: "/categoria/pantalones" },
{ label: "Hoodies", href: "/categoria/hoodies" },
{ label: "Chaquetas", href: "/categoria/chaquetas" },
];

// 💡 RUTAS FORZADAS Y BLINDADAS
const FORCED_COL2: NavLink[] = [
{ label: "Contacto", href: "/contacto" },
// { label: "Guía de tallas", href: "/tallas" }, 
{ label: "Envíos y devoluciones", href: "/legal/envios-y-devoluciones" },
{ label: "Términos y condiciones", href: "/legal/terminos-y-condiciones" },
{ label: "Política de privacidad", href: "/legal/politica-de-privacidad" },
];

interface Props {
footerData?: FooterData | null;
}

export default function Footer({ footerData }: Props) {
// Tagline y Col 1 siguen leyendo del administrador si quieres cambiarlos
const tagline = footerData?.tagline 
  ?? "Moda masculina oscura. Para hombres que saben lo que quieren. Bogotá, Colombia.";
const col1 = footerData?.col1Links ?? DEFAULT_COL1;

// 💡 FIX: La Columna 2 AHORA IGNORA AL ADMINISTRADOR y usa nuestras rutas forzadas
const col2 = FORCED_COL2;

return (
  <footer className="bg-noir-black text-white">
    <div className="max-w-screen-xl mx-auto px-8 pt-14 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <Link href="/" className="inline-block mb-5">
            <Image src="/logo.svg" alt="NOIR LOVERS" width={140} height={20}
              className="brightness-0 invert" style={{ height: "auto" }} />
          </Link>
          <p className="text-xs text-white/40 leading-relaxed max-w-[220px]">
            {tagline}
          </p>
        </div>

        {/* Col 1 */}
        <div>
          <ul className="space-y-[10px]">
            {col1.map((l) => (
              <li key={l.href}>
                <Link href={l.href}
                  className="text-xs text-white/50 hover:text-white transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2 */}
        <div>
          <ul className="space-y-[10px]">
            {col2.map((l) => (
              <li key={l.href}>
                <Link href={l.href}
                  className="text-xs text-white/50 hover:text-white transition-colors">
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