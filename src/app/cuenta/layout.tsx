import CuentaSidebar from "@/components/cuenta/CuentaSidebar";

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-noir-gray">
      <div className="max-w-screen-xl mx-auto px-6 py-12 flex gap-8">
        <CuentaSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
