import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated at build/request time via Next's built-in ImageResponse (next/og) - no extra
 * dependency, no binary image asset to optimize or ship (docs/PHASE-5.4.md "Social Preview":
 * 1200x630, dark premium background, strong typography, brand identity). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "radial-gradient(circle at 25% 20%, #141f38 0%, #0b1120 65%)",
          color: "#e7ecf5",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: "rgba(59,130,246,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🎓
          </div>
          <div style={{ fontSize: 28, fontWeight: 600 }}>90-Day Business School</div>
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.08, maxWidth: 920 }}>
          Build Better Business Thinking.
        </div>
        <div style={{ fontSize: 28, color: "#94a3b8", marginTop: 28, maxWidth: 800 }}>
          A structured 90-day journey through business, startups, finance and strategy.
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
          {["90 Days", "15 Phases", "12+ Calculators"].map((label) => (
            <div
              key={label}
              style={{
                fontSize: 22,
                fontWeight: 600,
                color: "#eab308",
                background: "rgba(234,179,8,0.12)",
                borderRadius: 999,
                padding: "8px 22px",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
