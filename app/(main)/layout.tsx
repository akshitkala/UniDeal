import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import { SellProvider } from "@/components/listing/SellProvider";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <SellProvider>
            <div
                style={{
                    display: "grid",
                    gridTemplateAreas: '"topbar topbar" "sidebar main"',
                    gridTemplateRows: "60px 1fr",
                    gridTemplateColumns: "240px 1fr",
                    height: "100dvh",
                    overflow: "hidden",
                }}
                className="main-layout-grid"
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
        @media (max-width: 1023px) {
          .main-layout-grid aside { display: none !important; }
          .main-layout-grid {
            grid-template-areas: "topbar" "main" !important;
            grid-template-columns: 1fr !important;
          }
        }
      `}} />
                <div style={{ gridArea: "topbar" }}>
                    <Topbar />
                </div>
                <div style={{ gridArea: "sidebar" }}>
                    <Sidebar />
                </div>
                <main style={{ gridArea: "main", overflowY: "auto", background: "var(--bg)" }}>
                    {children}
                </main>
            </div>
        </SellProvider>
    );
}
