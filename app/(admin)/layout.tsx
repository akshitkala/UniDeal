import Topbar from "@/components/layout/Topbar";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateAreas: '"topbar topbar" "sidebar main"',
                gridTemplateRows: "60px 1fr",
                gridTemplateColumns: "240px 1fr",
                height: "100dvh",
                overflow: "hidden",
            }}
            className="admin-layout-grid"
        >
            <style dangerouslySetInnerHTML={{
                __html: `
        @media (max-width: 1023px) {
          .admin-layout-grid aside { display: none !important; }
          .admin-layout-grid {
            grid-template-areas: "topbar" "main" !important;
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
            <div style={{ gridArea: "topbar" }}>
                <Topbar />
            </div>
            <div style={{ gridArea: "sidebar" }}>
                <AdminSidebar />
            </div>
            <main style={{ gridArea: "main", overflowY: "auto", background: "var(--bg)" }}>
                {children}
            </main>
        </div>
    );
}
