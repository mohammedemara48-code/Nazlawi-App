export function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function compressImage(file: File, max = 1280) {
  if (!file.type.startsWith("image/")) return readAsDataUrl(file);
  const dataUrl = await readAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.82);
}

const MAX_VIDEO_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_SECONDS = 30;

export async function validatePromoVideo(file: File) {
  if (!file.type.startsWith("video/")) return "اختار فيديو";
  if (file.size > MAX_VIDEO_BYTES) return "الفيديو أكبر من 10MB";
  const url = URL.createObjectURL(file);
  try {
    const duration = await new Promise<number>((resolve, reject) => {
      const el = document.createElement("video");
      el.preload = "metadata";
      el.onloadedmetadata = () => resolve(el.duration || 0);
      el.onerror = () => reject(new Error("video"));
      el.src = url;
    });
    if (duration > MAX_VIDEO_SECONDS + 0.4) return "الفيديو أطول من 30 ثانية";
  } finally {
    URL.revokeObjectURL(url);
  }
  return null;
}
