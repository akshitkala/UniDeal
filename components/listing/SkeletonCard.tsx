"use client";

export default function SkeletonCard() {
    return (
        <div style={{
            background: "var(--surface)",
            borderRadius: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            overflow: "hidden",
            height: "100%",
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes shimmer {
          0% { background-position: -468px 0 }
          100% { background-position: 468px 0 }
        }
        .shimmer {
          background: #f6f7f8;
          background-image: linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%);
          background-repeat: no-repeat;
          background-size: 800px 100%;
          display: inline-block;
          position: relative;
          animation: shimmer 1s linear infinite forwards;
        }
      `}} />
            <div className="shimmer" style={{ width: "100%", aspectRatio: "1/1" }} />
            <div style={{ padding: 16 }}>
                <div className="shimmer" style={{ height: 20, width: "80%", borderRadius: 4, marginBottom: 12 }} />
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="shimmer" style={{ height: 14, width: 14, borderRadius: "50%" }} />
                    <div className="shimmer" style={{ height: 12, width: "40%", borderRadius: 4 }} />
                </div>
            </div>
        </div>
    );
}
