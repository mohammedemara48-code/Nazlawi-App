import { uploadMarketMedia } from "@/lib/nazlawi/blob";
import { compressImage, readAsDataUrl, validatePromoVideo } from "./media";

export async function uploadCompressedImage(file: File) {
  const dataUrl = await compressImage(file);
  return uploadMarketMedia({
    data: {
      filename: file.name.replace(/\.[^.]+$/, "") + ".jpg",
      contentType: "image/jpeg",
      dataUrl,
    },
  });
}

export async function uploadPromoVideo(file: File) {
  const blocked = await validatePromoVideo(file);
  if (blocked) return { ok: false as const, url: "", error: blocked };
  if (file.size > 8_000_000) return { ok: false as const, url: "", error: "قصّر الفيديو تحت 8MB" };
  const dataUrl = await readAsDataUrl(file);
  return uploadMarketMedia({
    data: { filename: file.name, contentType: file.type || "video/mp4", dataUrl },
  });
}
