export type CekilenHaber = {
  id: string;
  kaynak: string;
  baslik: string;
  tarih: string;
  link: string;
  govde: string;
};

export type TaramaSonucu = {
  haberler: CekilenHaber[];
  tarandi: number;
  mesaj: string;
};
