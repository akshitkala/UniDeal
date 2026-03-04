export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                background: "var(--bg)",
                minHeight: "100dvh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {children}
        </div>
    );
}
