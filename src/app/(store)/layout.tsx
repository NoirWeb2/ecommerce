// src/app/(store)/layout.tsx
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartSidebar from "@/components/store/CartSidebar";
import { prisma } from "@/lib/prisma";

export default async function StoreLayout({
children,
}: {
children: React.ReactNode;
}) {
const settings = await prisma.siteSetting.findMany({
  where: {
    section: { in: ["texts", "header", "layout"] }
  }
});

const map: Record<string, Record<string, string>> = {};
for (const s of settings) {
  if (!map[s.section]) map[s.section] = {};
  map[s.section][s.key] = s.value;
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
    {/* ✅ Solo el Navbar — ya tiene el ticker adentro */}
    <Navbar headerData={{ ...headerData, announcementText }} />
    <CartSidebar />
    <main>{children}</main>
    <Footer footerData={footerData} />
  </>
);
}