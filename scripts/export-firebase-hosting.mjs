import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dest = join(process.cwd(), "firebase-hosting");
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });

const publicDir = join(process.cwd(), "public");
if (existsSync(publicDir)) cpSync(publicDir, dest, { recursive: true });

const vercelStatic = join(process.cwd(), ".vercel/output/static");
if (existsSync(vercelStatic)) cpSync(vercelStatic, dest, { recursive: true });

const assetsDir = join(dest, "assets");
const assets = existsSync(assetsDir) ? readdirSync(assetsDir) : [];
const js = assets.find((f) => f.startsWith("index-") && f.endsWith(".js"));
const css = assets.find((f) => f.endsWith(".css"));

const html = `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
    <meta name="theme-color" content="#047857" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="نزلاوي" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" />
    ${css ? `<link rel="stylesheet" href="/assets/${css}" />` : ""}
    <title>نزلاوي</title>
  </head>
  <body>
    <div id="app"></div>
    ${js ? `<script type="module" src="/assets/${js}"></script>` : ""}
  </body>
</html>
`;
writeFileSync(join(dest, "index.html"), html);
console.log("[firebase] exported", dest, { js, css });
