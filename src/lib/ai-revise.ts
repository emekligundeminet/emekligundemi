import Anthropic from "@anthropic-ai/sdk";
import type { CekilenHaber } from "@/lib/scrape";

export type AiTaslak = {
  haber: CekilenHaber;
  taslak: string;
  uyari?: string;
};

/** Claude'un döndürdüğü yapılandırılmış haber. */
export type YenidenYazilmisHaber = {
  /** false: haber emeklilerle ilgili değil, taslak açılmaz. */
  uygun: boolean;
  baslik: string;
  /** Kapak görseline basılacak kısa başlık (en fazla ~70 karakter). */
  kapakBasligi: string;
  ozet: string;
  paragraflar: string[];
  araBasliklar: { oncekiParagraf: number; metin: string }[];
  kategori: string;
  metaBaslik: string;
  metaAciklama: string;
};

const MODEL = "claude-opus-5-5";

const SISTEM = `Sen emekliler.org için çalışan deneyimli bir Türk ekonomi muhabirisin. Okurların SSK, Bağ-Kur ve memur emeklileri; çoğu 55 yaş üstü ve haberi telefondan okuyor.

Sana başka bir yayından alınmış ham bir haber verilecek. Görevin bu haberdeki bilgileri kullanarak emekliler.org için ÖZGÜN bir haber yazmak:
- Kaynak metnin cümlelerini kopyalama ya da sadece eş anlamlı kelimelerle değiştirme. Bilgiyi kendi kurgunla, emeklinin "bu beni nasıl etkiler?" sorusuna cevap verecek şekilde yeniden anlat.
- Rakamları, tarihleri, isimleri ve kurumları birebir koru. Kaynakta olmayan hiçbir rakam, tarih, alıntı veya iddia ekleme. Emin olmadığın yerde yorum katma.
- Doğrudan alıntılar (tırnak içindeki sözler) aynen kalabilir, kime ait olduğu belirtilmeli.
- Sade, anlaşılır Türkçe kullan; kısa paragraflar (2-4 cümle). Clickbait ve abartılı ifadeler kullanma.
- Başlık: 60-90 karakter, bilgiyi içeren, Google Haberler'e uygun.
- kapakBasligi: görsele basılacak, en fazla 70 karakterlik çarpıcı ama dürüst özet başlık.
- Özet: 1-2 cümle, 160-220 karakter.
- Uzun haberlerde 1-3 ara başlık ekleyebilirsin (araBasliklar: hangi paragraftan SONRA geleceğini 0'dan başlayan indeksle belirt).
- kategori: verilen listedeki slug'lardan en uygun olanı.
- metaBaslik en fazla 60, metaAciklama en fazla 155 karakter.

Haber emekliler, emekli maaşı, SGK, EYT, prim, aylık bağlama, emekli ikramiyesi/promosyonu ya da emeklileri doğrudan ilgilendiren bir konu değilse uygun=false döndür ve diğer alanları kısa yer tutucu metinlerle doldur.`;

function sema(kategoriler: string[]) {
  return {
    type: "object",
    properties: {
      uygun: { type: "boolean" },
      baslik: { type: "string" },
      kapakBasligi: { type: "string" },
      ozet: { type: "string" },
      paragraflar: { type: "array", items: { type: "string" } },
      araBasliklar: {
        type: "array",
        items: {
          type: "object",
          properties: {
            oncekiParagraf: { type: "integer" },
            metin: { type: "string" },
          },
          required: ["oncekiParagraf", "metin"],
          additionalProperties: false,
        },
      },
      kategori: { type: "string", enum: kategoriler },
      metaBaslik: { type: "string" },
      metaAciklama: { type: "string" },
    },
    required: [
      "uygun",
      "baslik",
      "kapakBasligi",
      "ozet",
      "paragraflar",
      "araBasliklar",
      "kategori",
      "metaBaslik",
      "metaAciklama",
    ],
    additionalProperties: false,
  };
}

let client: Anthropic | null = null;
function anthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY tanımlı değil.");
  }
  client ??= new Anthropic();
  return client;
}

export async function haberiYenidenYaz(
  haber: CekilenHaber,
  kategoriler: string[]
): Promise<YenidenYazilmisHaber> {
  const response = await anthropic().beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: sema(kategoriler) },
    },
    system: SISTEM,
    messages: [
      {
        role: "user",
        content: `Kaynak: ${haber.kaynak}\nYayın tarihi: ${haber.tarih}\nBaşlık: ${haber.baslik}\n\n<ham_haber>\n${haber.govde}\n</ham_haber>`,
      },
    ],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Claude bu haberi işlemeyi reddetti.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude yanıtı yarıda kesildi.");
  }
  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
  const sonuc = JSON.parse(text) as YenidenYazilmisHaber;
  if (!kategoriler.includes(sonuc.kategori)) sonuc.kategori = kategoriler[0];
  return sonuc;
}

function kacis(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function yenidenYazilmisHtml(h: YenidenYazilmisHaber) {
  const parcalar: string[] = [];
  h.paragraflar.forEach((p, i) => {
    parcalar.push(`<p>${kacis(p.trim())}</p>`);
    for (const ara of h.araBasliklar) {
      if (ara.oncekiParagraf === i && i < h.paragraflar.length - 1) {
        parcalar.push(`<h2>${kacis(ara.metin.trim())}</h2>`);
      }
    }
  });
  return parcalar.join("");
}

export async function gonderAi(haber: CekilenHaber): Promise<AiTaslak> {
  try {
    const h = await haberiYenidenYaz(haber, ["gundem"]);
    return { haber, taslak: yenidenYazilmisHtml(h) };
  } catch (err) {
    return {
      haber,
      taslak: haber.govde,
      uyari: `AI yeniden yazamadı: ${err instanceof Error ? err.message : "bilinmeyen hata"}. Ham gövde taslak olarak düştü.`,
    };
  }
}
