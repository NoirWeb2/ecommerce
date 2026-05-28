import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F7F7F7]">
      <AdminSidebar />
      <div className="flex-1 ml-52">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
