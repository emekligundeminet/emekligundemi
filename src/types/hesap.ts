import type { Json } from "@/types/db";

export type HesapParametre = {
  id: string;
  anahtar: string;
  etiket: string;
  deger: Json;
  birim: string | null;
  grup: string;
  aciklama: string | null;
  updated_at: string | null;
};

export type HesapParamMap = Record<string, Json>;
