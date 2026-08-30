export const KUNYE_FIELDS = [
  { key: "yayin_adi", label: "Yayın Adı" },
  { key: "yayin_turu", label: "Yayın Türü" },
  { key: "yayin_sahibi", label: "Yayın Sahibi" },
  { key: "genel_yayin_yonetmeni", label: "Genel Yayın Yönetmeni" },
  { key: "sorumlu_mudur", label: "Sorumlu Müdür" },
  { key: "yonetim_yeri", label: "Yönetim Yeri" },
  { key: "telefon", label: "İletişim Telefonu" },
  { key: "eposta", label: "E-Posta" },
  { key: "uets_adresi", label: "Ulusal Elektronik Tebligat (UETS) Adresi" },
  { key: "kep_adresi", label: "KEP Adresi" },
  { key: "yer_saglayici_unvan", label: "Yer Sağlayıcı Ünvanı" },
  { key: "yer_saglayici_adres", label: "Yer Sağlayıcı Adresi" },
] as const;

export type KunyeKey = (typeof KUNYE_FIELDS)[number]["key"];

export type KunyeVeri = Partial<Record<KunyeKey, string>>;
