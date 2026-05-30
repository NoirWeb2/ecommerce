import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartSidebar from "@/components/store/CartSidebar";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StoreLayout({
children,
}: {
children: React.ReactNode;
}) {
let map: Record<string, Record<string, string>> = {};

try {
  const settings = await prisma.siteSetting.findMany({
    where: {
      section: { in: ["texts", "header", "layout"] }
    }
  });

  for (const s of settings) {
    if (!map[s.section]) map[s.section] = {};
    map[s.section][s.key] = s.value;
  }
} catch (error) {
  console.error("Error cargando el layout:", error);
}

let headerData = null;
try {
  headerData = map["header"]?.["data"]
    ? JSON.parse(map["header"]["data"])
    : null;
} catch {}

let footerData = null;
try {
  footerData = map["layout"]?.["footer"]
    ? JSON.parse(map["layout"]["footer"])
    : null;
} catch {}

const announcementText = map["texts"]?.["announcement"] ?? null;

return (
  <>
    <Navbar headerData={{ ...headerData, announcementText }} />
    <CartSidebar />
    <main>{children}</main>
    <Footer footerData={footerData} />
  </>
);
}