/** Dosyadan doğal genişlik/yükseklik. Upload cevabında boyut yoksa kullanılır. */
export function readNaturalSize(file: File): Promise<{ width: number; height: number }> {
  return (async () => {
    if (typeof createImageBitmap === "function") {
      try {
        const bmp = await createImageBitmap(file);
        const width = bmp.width;
        const height = bmp.height;
        bmp.close();
        if (width > 0 && height > 0) return { width, height };
      } catch {
        // Image() yolu
      }
    }

    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = document.createElement("img");
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        URL.revokeObjectURL(url);
        if (width > 0 && height > 0) resolve({ width, height });
        else reject(new Error("Boyut okunamadı."));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Görsel okunamadı."));
      };
      img.src = url;
    });
  })();
}
