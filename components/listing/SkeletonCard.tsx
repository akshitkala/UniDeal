"use client";

export default function SkeletonCard() {
    return (
        <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r-md)",
            overflow: "hidden",
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
            <div className="shimmer" style={{ width: "100%", aspectRatio: "4/3" }} />
            <div style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <div className="shimmer" style={{ height: 20, width: "40%", borderRadius: 4 }} />
                    <div className="shimmer" style={{ height: 20, width: "20%", borderRadius: 4 }} />
                </div>
                <div className="shimmer" style={{ height: 16, width: "100%", borderRadius: 4, marginBottom: 8 }} />
                <div className="shimmer" style={{ height: 16, width: "80%", borderRadius: 4, marginBottom: 16 }} />
                <div style={{ paddingTop: 12, borderTop: "1px solid var(--bg-2)", display: "flex", justifyContent: "space-between" }}>
                    <div className="shimmer" style={{ height: 12, width: "30%", borderRadius: 4 }} />
                    <div className="shimmer" style={{ height: 12, width: "20%", borderRadius: 4 }} />
                </div>
            </div>
        </div>
    );
}
