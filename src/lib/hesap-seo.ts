/** Uzun SEO metinleri. Oran değil; admin `seo_*` parametresi varsa onu kullan. */

export const SEO_ZAM = `
Emekli zam hesaplama aracı, SSK, Bağ-Kur ve memur emeklisi aylığının bir sonraki
zam döneminde yaklaşık ne kadar olacağını gösterir. Emekli türünüzü seçip şu an
aldığınız aylığı yazmanız yeterlidir.

Emekli aylıklarına yılda iki kez, ocak ve temmuzda zam yapılır. SSK ve Bağ-Kur
emeklilerinin zammı, önceki altı ayın enflasyonu kadardır: ocak zammı için
temmuz–aralık, temmuz zammı için ocak–haziran enflasyonu esas alınır. Altı aylık
enflasyon, aylık oranlar toplanarak değil, TÜİK'in tüketici fiyat endeksindeki
artışla bulunur. Örneğin Temmuz 2026'da SSK ve Bağ-Kur emeklilerine yüzde 17,76
zam yapıldı.

Memur emeklilerinin (Emekli Sandığı) zammı iki parçadan oluşur: biten dönemde
enflasyon toplu sözleşme zammını aştıysa aradaki fark ve yeni dönemin toplu
sözleşme zammı. Temmuz 2026'da bu hesapla memur emeklilerine yüzde 13,52 zam
yapıldı. 2027'nin ilk yarısı için toplu sözleşme zammı yüzde 5'tir.

Dönem bitmeden yapılan hesaplar tahmindir. Araç, açıklanan ayların enflasyonunu
kesin olarak kullanır, kalan aylar için tahmini bir oran varsayar ve şu ana kadar
kesinleşen zammı ayrıca gösterir. En düşük emekli aylığı alanların artışı zam
oranıyla değil, ayrı bir yasal düzenlemeyle belirlenir; Temmuz 2026'dan itibaren
en düşük aylık 23.552 TL'dir.

Sonuç vergi, icra kesintisi veya kişiye özel ödemeleri içermez. Kesin tutar
e-Devlet'te ve aylığınızın yattığı banka hesabında görünür.
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
