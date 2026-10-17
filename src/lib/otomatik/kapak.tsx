import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Discover en az 1200px ister; og:image ile aynı 16:9. */
export const KAPAK_W = 1600;
export const KAPAK_H = 900;

const FONT_DIR = join(process.cwd(), "src/assets/fonts");

let fontlar: Promise<{ extraBold: Buffer; bold: Buffer }> | null = null;
function fontYukle() {
  fontlar ??= Promise.all([
    readFile(join(FONT_DIR, "Figtree-ExtraBold.ttf")),
    readFile(join(FONT_DIR, "Figtree-Bold.ttf")),
  ]).then(([extraBold, bold]) => ({ extraBold, bold }));
  return fontlar;
}

function baslikPunto(baslik: string) {
  if (baslik.length <= 40) return 104;
  if (baslik.length <= 60) return 90;
  return 78;
}

/**
 * Telifsiz markalı kapak: kırmızı zemin, kategori etiketi, başlık, logo.
 * Kaynak sitenin fotoğrafı kullanılmaz.
 */
export async function kapakUret(baslik: string, kategori: string): Promise<Buffer> {
  const { extraBold, bold } = await fontYukle();
  const res = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "linear-gradient(135deg, #F71515 0%, #B80D0D 100%)",
          color: "white",
          fontFamily: "Figtree",
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: "white",
              color: "#F71515",
              fontSize: 36,
              fontWeight: 700,
              padding: "12px 28px",
              letterSpacing: 1,
            }}
          >
            {kategori.toLocaleUpperCase("tr-TR")}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: baslikPunto(baslik),
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -2,
          }}
        >
          {baslik}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: -2 }}>
            Emekliler
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, paddingBottom: 10 }}>
            .org
          </div>
        </div>
      </div>
    ),
    {
      width: KAPAK_W,
      height: KAPAK_H,
      fonts: [
        { name: "Figtree", data: extraBold, weight: 800, style: "normal" },
        { name: "Figtree", data: bold, weight: 700, style: "normal" },
      ],
    }
  );
  return Buffer.from(await res.arrayBuffer());
}
