/**
 * Araç sayfası SEO yazısı: boş satırla ayrılan bloklar; "## " h2, "### " h3,
 * gerisi p. Başlıksız düz metin (eski panel `seo_*` değerleri) "Nasıl
 * hesaplanır?" başlığıyla tek paragraf gösterilir.
 */
export function SeoMetin({ metin }: { metin: string }) {
  const bloklar = metin
    .trim()
    .split(/\n\s*\n/)
    .map((b) => b.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (bloklar.length === 0) return null;
  const basliksiz = !bloklar.some((b) => b.startsWith("## "));

  return (
    <section className="mt-10 pt-8">
      {basliksiz ? <h2 className="text-xl font-extrabold text-neutral-900">Nasıl hesaplanır?</h2> : null}
      {bloklar.map((b, i) => {
        if (b.startsWith("### ")) {
          return (
            <h3 key={i} className="mt-6 text-[17px] font-bold text-neutral-900">
              {b.slice(4)}
            </h3>
          );
        }
        if (b.startsWith("## ")) {
          return (
            <h2 key={i} className={`${i === 0 ? "" : "mt-8 "}text-xl font-extrabold text-neutral-900`}>
              {b.slice(3)}
            </h2>
          );
        }
        return (
          <p key={i} className="mt-3 text-[15px] leading-relaxed text-neutral-700">
            {b}
          </p>
        );
      })}
    </section>
  );
}
