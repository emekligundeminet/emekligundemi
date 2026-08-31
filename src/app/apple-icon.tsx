import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS / Google favicon raster. SVG apple-touch birçok istemcide yok. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#F71515",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 92,
          fontWeight: 800,
          letterSpacing: -4,
        }}
      >
        E
      </div>
    ),
    { ...size }
  );
}
