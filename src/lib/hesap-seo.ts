import { asNumber, asString, formatYuzde } from "@/lib/hesap-formulas";
import type { HesapParamMap } from "@/types/hesap";

/**
 * Araç sayfalarının altındaki SEO yazıları. Biçim (SeoMetin bileşeni okur):
 * boş satırla ayrılan bloklar; "## " ile başlayan blok h2, "### " h3, gerisi p.
 * Tutar ve oranlar panel parametrelerinden okunur, ay değişince metin eskimez.
 * Panelde `seo_*` parametresi doluysa sayfa onu aynı biçimde kullanır.
 * Yeni araç: buraya bir fonksiyon + sayfada `seo={...}`.
 */

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

function ayYil(anahtar: string) {
  const m = /^(\d{4})-(\d{2})$/.exec(anahtar.trim());
  if (!m) return "";
  return `${AYLAR[Number(m[2]) - 1] ?? ""} ${m[1]}`.trim();
}

function tl(n: number) {
  return `${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} TL`;
}

function enDusuk(map: HesapParamMap) {
  const n = asNumber(map.en_dusuk_emekli_ayligi);
  const donem = ayYil(asString(map.donem_baslangic));
  if (!n) return "";
  return donem
    ? `${donem} itibarıyla en düşük emekli aylığı ${tl(n)} olarak uygulanıyor.`
    : `En düşük emekli aylığı ${tl(n)} olarak uygulanıyor.`;
}

export function seoEmekliMaasi(map: HesapParamMap) {
  return `
## Emekli maaşı nasıl hesaplanır?

Emekli maaşı, ortalama aylık kazancın aylık bağlama oranıyla çarpılmasıyla bulunur. İlk kez 1 Ekim 2008'den sonra sigortalı olanlar için 5510 sayılı Kanun'a göre her 360 prim günü yüzde 2 oran kazandırır; oran en fazla yüzde 90 olabilir.

### Örnek hesap

7.200 prim günü (20 yıl) olan birinin bağlama oranı yüzde 40'tır. Ortalama brüt kazancı 75.000 TL ise emekli aylığı yaklaşık 30.000 TL olur. Hesaplanan tutar en düşük aylığın altında kalırsa en düşük aylık ödenir. ${enDusuk(map)}

### Kazanç neden bugünkü parayla giriliyor?

SGK geçmiş yıllardaki kazançları enflasyon ve büyüme oranıyla güncelleyerek bugüne taşır. Bu yüzden kazancı bugünkü parayla yazmak sonucu gerçeğe yaklaştırır.

### 2008 öncesi girişliler

İlk sigorta girişi Ekim 2008'den önce olanların aylığı 2000 öncesi, 2000–2008 ve 2008 sonrası dönemlere bölünerek ayrı oranlarla hesaplanır. Bu kişiler için araç yalnızca yaklaşık bir fikir verir.

## Sonuç kesin mi?

Hayır, araç tahmin üretir. Emekli olabilmek için yaş ve prim günü şartlarının da sağlanması gerekir. Kesin aylığı emeklilik başvurusundan sonra SGK hesaplar.
`;
}

export function seoZam(map: HesapParamMap) {
  const donem = ayYil(asString(map.donem_baslangic));
  const ssk = asNumber(map.zam_ssk_bagkur_donem);
  const memur = asNumber(map.zam_memur_donem);
  const yeniTs = asNumber(map.toplu_sozlesme_yeni);
  const sonZam =
    donem && ssk != null && memur != null
      ? `${donem} döneminde SSK ve Bağ-Kur emeklilerine ${formatYuzde(ssk)}, memur emeklilerine ${formatYuzde(memur)} zam yapıldı.`
      : "";
  return `
## Emekli zammı nasıl hesaplanır?

Emekli aylıklarına yılda iki kez, ocak ve temmuzda zam yapılır. Araç, emekli türünüzü ve bugünkü aylığınızı alarak bir sonraki dönemde yaklaşık ne kadar alacağınızı gösterir. ${sonZam}

### SSK ve Bağ-Kur emeklisi

Zam, önceki altı ayın enflasyonu kadardır: ocak zammı için temmuz–aralık, temmuz zammı için ocak–haziran enflasyonu esas alınır. Altı aylık oran, aylık oranlar toplanarak değil TÜİK tüketici fiyat endeksindeki artışla bulunur.

### Memur emeklisi (Emekli Sandığı)

Zam iki parçadan oluşur: biten dönemde enflasyon toplu sözleşme zammını aştıysa aradaki fark ve yeni dönemin toplu sözleşme zammı.${yeniTs != null ? ` Yeni dönem için toplu sözleşme zammı yüzde ${yeniTs.toLocaleString("tr-TR")} olarak belirlendi.` : ""}

### En düşük emekli aylığı

En düşük aylık alanların artışı zam oranıyla değil, ayrı bir yasal düzenlemeyle belirlenir. ${enDusuk(map)}

## Dönem bitmeden yapılan hesap kesin mi?

Hayır. Araç açıklanan ayların enflasyonunu kesin olarak kullanır, kalan aylar için tahmini bir oran varsayar ve şu ana kadar kesinleşen zammı ayrıca gösterir. Sonuca vergi, icra kesintisi veya kişiye özel ödemeler dahil değildir; kesin tutar e-Devlet'te görünür.
`;
}

export function seoIkramiye(map: HesapParamMap) {
  const tutar = asNumber(map.bayram_ikramiyesi_tutar);
  return `
## Emekli bayram ikramiyesi ne kadar?

Bayram ikramiyesi, Ramazan ve Kurban bayramlarından önce emeklilere ödenen sabit tutardır.${tutar ? ` Güncel tutar ${tl(tutar)} olarak ödeniyor.` : ""} Araç, tutarı ve açıklandıysa ödeme tarihini gösterir.

### Kimler alır?

SSK, Bağ-Kur ve Emekli Sandığı'ndan aylık alan emekliler ikramiye alır. Dul ve yetim aylığı alanlar ikramiyeyi aylıktaki hisseleri oranında alır; bu yüzden tam tutar her dosya için geçerli olmayabilir.

### Ne zaman ödenir?

Ödeme genellikle bayramdan birkaç gün önce, SGK'nın açıkladığı takvime göre aylığın yattığı banka hesabına yapılır. Tarih açıklanmadıysa araçta yalnızca tutar görünür.

## Tutar nasıl belirlenir?

İkramiye aylık zammından bağımsız bir kalemdir. Tutar kanunla veya Cumhurbaşkanı kararıyla belirlenir ve yıllar içinde değişebilir. Kesin ödemeniz e-Devlet ve banka kaydınızda yer alır.
`;
}

export const SEO_ALIM = `
## Alım gücü kaybı nasıl hesaplanır?

Araç, geçmişteki bir tutarın bugünkü fiyatlarla karşılığını TÜİK tüketici fiyat endeksiyle (TÜFE) hesaplar. Formül: geçmiş tutar × (bugünkü endeks ÷ geçmiş endeks). Sonuç "o günkü X TL bugün Y TL eder" diye gösterilir; kaybedilen alım gücü ayrıca yüzde olarak yazılır.

### Nasıl kullanılır?

Ay ve yılı seçip o tarihteki maaşınızı veya harcama tutarını yazın. Araç, eski maaşınızın bugün kaç liraya denk geldiğini ve aradaki farkı anında hesaplar.

### Sonucu nasıl okumalı?

TÜFE ortalama fiyat düzeyini yansıtır. Kira, gıda veya ilaç harcamaları kişiden kişiye değiştiği için sonuç bireysel enflasyon değil, genel bir göstergedir.

## Veriler nereden geliyor?

Endeks serisi TÜİK'in açıkladığı aylık TÜFE verisidir ve her yeni bültende güncellenir. Sayfa yatırım veya hukuki tavsiye niteliği taşımaz.
`;
