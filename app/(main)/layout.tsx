import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { connectDB } from "@/lib/db/connect";
import { SystemConfig } from "@/models/SystemConfig";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { SellProvider } from "@/components/listing/SellProvider";

async function MaintenanceScreen() {
    return (
        <div style={{
            height: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", background: "var(--bg)",
            padding: 40, textAlign: "center"
        }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🔧</div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 32, marginBottom: 12 }}>Under Maintenance</h1>
            <p style={{ color: "var(--ink-3)", maxWidth: 400, lineHeight: 1.6 }}>
                UniDeal is currently undergoing scheduled maintenance to improve your experience.
                We'll be back online shortly!
            </p>
            <div style={{ marginTop: 32, fontSize: 12, color: "var(--ink-4)" }}>
                Check back in a few minutes.
            </div>
        </div>
    );
}

import MainLayoutClient from "@/components/layout/MainLayoutClient";

export default async function MainLayout({
    children,
    modal,
}: {
    children: React.ReactNode;
    modal: React.ReactNode;
}) {
    await connectDB();
    const config = await SystemConfig.findOne({ _id: "global" });

    if (config?.maintenanceMode) {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;
        let isAdmin = false;

        if (token) {
            try {
                const payload = verifyAccessToken(token);
                isAdmin = payload.role === "admin" || payload.role === "superadmin";
            } catch (e) { }
        }

        if (!isAdmin) {
            return <MaintenanceScreen />;
        }
    }

    return (
        <SellProvider>
            <MainLayoutClient>
                {children}
            </MainLayoutClient>
            {modal}
        </SellProvider>
    );
}
