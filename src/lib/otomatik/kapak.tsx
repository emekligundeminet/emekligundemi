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

function KategoriEtiketi({ kategori }: { kategori: string }) {
  return (
    <div
      style={{
        display: "flex",
        background: "#F71515",
        color: "white",
        fontSize: 36,
        fontWeight: 700,
        padding: "12px 28px",
        letterSpacing: 1,
      }}
    >
      {kategori.toLocaleUpperCase("tr-TR")}
    </div>
  );
}

function Logo({ olcek = 1 }: { olcek?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8 * olcek }}>
      <div style={{ display: "flex", fontSize: 64 * olcek, fontWeight: 800, letterSpacing: -2 * olcek }}>
        Emekliler
      </div>
      <div style={{ display: "flex", fontSize: 30 * olcek, fontWeight: 700, paddingBottom: 10 * olcek }}>
        .org
      </div>
    </div>
  );
}

/** Stok yoksa: kırmızı zemin, kategori etiketi, başlık, logo. */
function DuzKapak({ baslik, kategori }: { baslik: string; kategori: string }) {
  return (
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
      <Logo />
    </div>
  );
}

/** Stok fotoğraf: alttan koyulaşan zemin, başlık, köşede şeffaf logo. */
function FotoKapak({ baslik, kategori, foto }: { baslik: string; kategori: string; foto: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        color: "white",
        fontFamily: "Figtree",
        background: "#111",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img
        src={foto}
        width={KAPAK_W}
        height={KAPAK_H}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 36%, rgba(0,0,0,0.92) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 64,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <KategoriEtiketi kategori={kategori} />
        <div style={{ display: "flex", opacity: 0.85, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
          <Logo olcek={0.85} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 72,
          display: "flex",
          fontSize: baslikPunto(baslik) - 8,
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: -2,
          textShadow: "0 3px 18px rgba(0,0,0,0.6)",
        }}
      >
        {baslik}
      </div>
    </div>
  );
}

/**
 * Telifsiz kapak. `foto` (data URL) verilirse panelden yüklenen stok
 * fotoğraf kullanılır; yoksa kırmızı markalı zemin. Kaynak sitenin
 * fotoğrafı asla kullanılmaz.
 */
export async function kapakUret(baslik: string, kategori: string, foto?: string | null): Promise<Buffer> {
  const { extraBold, bold } = await fontYukle();
  const res = new ImageResponse(
    foto ? (
      <FotoKapak baslik={baslik} kategori={kategori} foto={foto} />
    ) : (
      <DuzKapak baslik={baslik} kategori={kategori} />
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
