// src/app/(store)/layout.tsx
import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartSidebar from "@/components/store/CartSidebar";
import AnnouncementBar from "@/components/store/AnnouncementBar";
import { prisma } from "@/lib/prisma";

export default async function StoreLayout({
children,
}: {
children: React.ReactNode;
}) {
// Lee datos del admin desde la DB
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

// Parsea header
let headerData = null;
try {
  headerData = map["header"]?.["data"] 
    ? JSON.parse(map["header"]["data"]) 
    : null;
} catch {}

// Parsea footer
let footerData = null;
try {
  footerData = map["layout"]?.["footer"]
    ? JSON.parse(map["layout"]["footer"])
    : null;
} catch {}

const announcementText = map["texts"]?.["announcement"] ?? null;

return (
  <>
    <AnnouncementBar text={announcementText} />
    <Navbar headerData={headerData} />
    <CartSidebar />
    <main>{children}</main>
    <Footer footerData={footerData} />
  </>
);
}