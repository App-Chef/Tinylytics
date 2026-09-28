import { ImageResponse } from "next/og";

export const alt = "Tinylytics — Analytics without the noise.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#f4f2eb",
        color: "#121211",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
            background: "#121211",
            borderRadius: 16,
            padding: "16px 16px",
          }}
        >
          <div style={{ width: 12, height: 22, background: "#f4f2eb", borderRadius: 3 }} />
          <div style={{ width: 12, height: 36, background: "#f4f2eb", borderRadius: 3 }} />
          <div style={{ width: 12, height: 52, background: "#ff5b14", borderRadius: 3 }} />
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>tinylytics</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
          Analytics without the noise.
        </div>
        <div style={{ fontSize: 34, color: "#3d3c38" }}>
          Simple, privacy-friendly analytics for solo developers and small products.
        </div>
      </div>
      <div
        style={{ display: "flex", height: 14, background: "#ff5b14", border: "3px solid #121211", borderRadius: 4 }}
      />
    </div>,
    size,
  );
}
