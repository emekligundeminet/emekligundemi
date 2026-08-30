/** Uzun SEO metinleri. Oran değil; admin `seo_*` parametresi varsa onu kullan. */

export const SEO_ZAM = `
Emekli zam hesaplama aracı, SSK, Bağ-Kur ve memur emeklisi aylığının dönem zammından
sonra yaklaşık ne kadar olacağını gösterir. Form, güncel maaşınızı ve emeklilik
türünüzü alır; dönem oranı ile çarpar. Sonuç, en düşük emekli aylığı tabanının
altına düşerse ekranda taban tamamlaması uyarısı çıkar.

Zam dönemleri genellikle ocak ve temmuzda açıklanır. SSK ve Bağ-Kur tarafında
altı aylık TÜFE toplamı esas alınır. Memur emeklisinde toplu sözleşme zammı ile
enflasyon farkı birlikte uygulanır. Bu yüzden aynı dönemde iki grup farklı oran
görebilir. Araçtaki oranlar sitede sabit yazılmaz; yayın kurulunun girdiği
güncel parametrelerden okunur.

Hesaplama adımları şöyledir. Önce mevcut net veya bağlanan aylığı yazın. Türü
seçin. Resmi oran açıklanmışsa o oran kullanılır. Henüz açıklanmamış aylar için
senaryo sekmesinde TÜFE tahmini girebilirsiniz. Kümülatif oran, her ayın
(1 + yüzde/100) çarpımından bir çıkarılmasıyla bulunur. Bu, aylık enflasyonların
üst üste binmesini yansıtır; basit toplama değildir.

Sonuç kartında yeni maaş, zam tutarı ve dönem etiketi yer alır. Rakamlar
tahmindir. SGK bağlama, intibak, ek ödeme, vergi ve icra kesintisi kişiye göre
değişir. Resmi tutar e-Devlet ve banka hesabınızda görünür. Senaryo sekmesi
projeksiyondur; “resmi oran henüz açıklanmadı” notunu dikkate alın.

Aracı, zam haberi çıktığında veya maaşınızı planlarken kullanın. Oran değişince
yönetim panelinden parametreyi güncellemek yeterlidir; sayfa bir saat içinde
yenilenir. Kaynak olarak Resmî Gazete, TÜİK TÜFE bülteni ve SGK duyurularını
izleyin. Bu metin hukuki görüş veya kesin hak doğurmaz.
`.replace(/\s+/g, " ").trim();

export const SEO_IKRAMIYE = `
Emekli bayram ikramiyesi, Ramazan ve Kurban dönemlerinde ödenen sabit tutardır.
Hesaplama aracı, panelde tanımlı güncel ikramiye tutarını ve varsa sonraki
bayram ile ödeme tarihini gösterir. Geri sayım, tarayıcınızın saatine göre
kalan günü canlı günceller.

İkramiye, aylık zammından bağımsız bir kalemdir. Tutar yasayla veya Cumhurbaşkanı
kararıyla belirlenebilir; yıllar arasında değişir. Dul ve yetim aylığı alanlar
çoğu dönemde hisseleri oranında ikramiye alır. Ekrandaki not bu yüzden statik
bir uyarıdır: tam tutar her dosya için geçerli olmayabilir.

Ödeme tarihi ile bayram günü aynı olmayabilir. Bankalar, SGK takvimine göre
ikramiyeyi bayramdan önce yatırır. Tarih girildiyse araçta ayrıca görünür.
Tarih boşsa yalnızca tutar yazılır; uydurma gün üretilmez.

Bu sayfa, ikramiye haberlerini ve resmi duyuruları tek yerde toparlamak içindir.
Kesin ödeme gününüz banka ve e-Devlet kaydınızdadır. Tutar değişince yöneticinin
parametreyi güncellemesi yeterlidir. Metin tavsiye niteliğinde değildir.
`.replace(/\s+/g, " ").trim();

export const SEO_ALIM = `
Alım gücü kaybı aracı, geçmişteki bir tutarın bugünkü fiyatlara denk gelen
karşılığını TÜFE endeksiyle hesaplar. Formül basittir: geçmiş tutar çarpı
(bugünkü endeks / geçmiş endeks). Sonuç, “o günkü X TL bugün Y TL eder”
cümlesine dönüşür. Kaybedilen alım gücü yüzde olarak da gösterilir.

Endeks serisi TÜİK tüketici fiyat endeksinden gelir. Seri boşsa araç tutar
üretmez. Yönetici, ay-yıl anahtarlarıyla endeksi panele girer. Böylece yeni
bülten çıktığında kod değişmez. Kullanıcı ay ve yıl seçer, o tarihteki maaşı
veya sepet tutarını yazar.

Hesap, ortalama fiyat düzeyini yansıtır. Konut, gıda veya ilaç sepeti kişiye
göre farklıdır. Bu yüzden sonuç makro bir yaklaşımdır; bireysel enflasyon
değildir. Paylaş butonları, sonucu WhatsApp veya X’te iletmek içindir.

Aracı, zam tartışmalarında veya eski maaşın bugünkü karşılığını anlatırken
kullanın. Kaynak TÜİK’tir. Yanlış veya eksik endeks girilirse sonuç sapar;
seriyi düzenli güncelleyin. Bu sayfa yatırım veya hukuki tavsiye değildir.
`.replace(/\s+/g, " ").trim();
