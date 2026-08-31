import { ImageResponse } from "next/og";

export const runtime = "edge";

/** Google News publisher.logo — 600×160 PNG, en az 112px yükseklik. */
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
          fontSize: 64,
          fontWeight: 800,
          letterSpacing: -1,
        }}
      >
        Emekliler.org
      </div>
    ),
    { width: 600, height: 160 }
  );
}
