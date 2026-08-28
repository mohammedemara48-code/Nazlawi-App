import { createServerFn } from "@tanstack/react-start";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 80) || "file";
}

function blobToken() {
  const named =
    process.env.BLOB_READ_WRITE_TOKEN ||
    process.env.VERCEL_BLOB_READ_WRITE_TOKEN ||
    process.env.NZLAWI_READ_WRITE_TOKEN ||
    process.env.NAZLAWI_READ_WRITE_TOKEN ||
    "";
  if (named) return named;
  for (const [key, value] of Object.entries(process.env)) {
    if (key.endsWith("_READ_WRITE_TOKEN") && value) return value;
  }
  return "";
}

export const uploadMarketMedia = createServerFn({ method: "POST" })
  .validator((d: { filename: string; contentType: string; dataUrl: string }) => d)
  .handler(async ({ data }) => {
    const filename = String(data.filename ?? "photo.jpg").slice(0, 120);
    const contentType = String(data.contentType ?? "image/jpeg").slice(0, 80);
    const dataUrl = String(data.dataUrl ?? "");
    if (!dataUrl.startsWith("data:")) return { ok: false as const, url: "" };

    const raw = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
    const buffer = Buffer.from(raw ?? "", "base64");
    if (!buffer.length) return { ok: false as const, url: "" };

    const token = blobToken();
    const storedName = `${Date.now()}-${safeName(filename)}`;

    if (token) {
      const { put } = await import("@vercel/blob");
      const stored = await put(`nazlawi/${storedName}`, buffer, {
        access: "public",
        token,
        contentType: contentType || "application/octet-stream",
      });
      return { ok: true as const, url: stored.url };
    }

    const { mkdir, writeFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, storedName), buffer);
    return { ok: true as const, url: `/uploads/${storedName}` };
  });
