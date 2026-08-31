import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Next bazı istemcilerde /apple-icon değil /apple-icon.png ister. */
export async function GET() {
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
    { width: 180, height: 180 }
  );
}
