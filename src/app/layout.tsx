import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://noirlovers.com"),
  title: {
    default: "NOIR LOVERS — Moda masculina de lujo | Bogotá, Colombia",
    template: "%s | NOIR LOVERS",
  },
  description:
    "La primera marca colombiana de moda masculina especializada 100% en negro. Diseñada para el hombre latinoamericano que prefiere hablar con su presencia.",
  keywords: ["noir lovers", "moda masculina", "ropa negra", "colombia", "bogota", "fashion"],
  authors: [{ name: "NOIR LOVERS" }],
  creator: "NOIR LOVERS",
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: "https://noirlovers.com",
    siteName: "NOIR LOVERS",
    title: "NOIR LOVERS — Moda masculina de lujo",
    description: "La primera marca colombiana de moda masculina especializada 100% en negro.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOIR LOVERS",
    description: "La primera marca colombiana de moda masculina especializada 100% en negro.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "#0A0A0A", color: "#FAFAFA", border: "none" },
          }}
        />
      </body>
    </html>
  );
}
