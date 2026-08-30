/** next/image `sizes` — mobilde viewport'tan büyük kaynak seçilmesin. */

export const IMG_SIZES = {
  /** Haber kapağı / kategori lead (LCP). */
  lcp: "(max-width: 768px) 100vw, 700px",
  /** Anasayfa ana manşet. */
  heroMain: "(max-width: 1024px) 100vw, 700px",
  /** Hero yan kolon (mobilde küçük thumb). */
  heroSide: "(max-width: 1023px) 7.5rem, 280px",
  /** Anasayfa 4 kart şeridi (mobilde satır thumb). */
  strip4: "(max-width: 768px) 9rem, 25vw",
  /** 1 / 2 / 3 kolon grid. */
  grid3: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px",
  /** 2 kolon (spotlight yan). */
  col2: "(max-width: 1024px) 50vw, 240px",
  /** Tek kolon lead (bölüm). */
  sectionLead: "(max-width: 1024px) 100vw, 560px",
  /** Kategori bloğu sağ 2×2. */
  sectionGrid: "(max-width: 1024px) 50vw, 280px",
  /** Overlay yan stack. */
  stackSide: "(max-width: 1024px) 100vw, 280px",
  /** Satır thumb. */
  row: "144px",
  /** Feed featured / çift. */
  feedLead: "(max-width: 768px) 100vw, 700px",
  feedPair: "(max-width: 768px) 50vw, 360px",
} as const;
