// astro.config.mjs — конфигурация Astro для imten.ru
// Стек: статический билд → деплой на TimeWeb (прод) или GitHub Pages (превью).

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import compress from "astro-compress";
import fs from "node:fs";
import path from "node:path";

// На превью GitHub Pages — base path = /imten-site/.
// На проде imten.ru — base = '/' (переключается через ENV).
const SITE = process.env.SITE_URL || "https://datatelek.github.io";
const BASE = process.env.BASE_PATH || "/imten-site";

// Плагин: после билда копируем api/ (PHP-обработчик формы) в dist/api/
function copyApiFolder() {
  return {
    name: "copy-api-folder",
    hooks: {
      "astro:build:done": async () => {
        const src = path.resolve("./api");
        const dest = path.resolve("./dist/api");
        if (!fs.existsSync(src)) return;
        fs.mkdirSync(dest, { recursive: true });
        for (const file of fs.readdirSync(src)) {
          if (file === ".env") continue;
          const sp = path.join(src, file);
          if (fs.statSync(sp).isDirectory()) continue;
          fs.copyFileSync(sp, path.join(dest, file));
        }
        console.log("[copy-api-folder] api/ → dist/api/ скопировано");
      },
    },
  };
}

function copyHtaccess() {
  return {
    name: "copy-htaccess",
    hooks: {
      "astro:build:done": async () => {
        const src = path.resolve("./public/.htaccess");
        const dest = path.resolve("./dist/.htaccess");
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
          console.log("[copy-htaccess] .htaccess скопирован в dist/");
        }
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: "never",
  build: {
    format: "directory",
    inlineStylesheets: "auto",
    assets: "_astro",
  },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: "viewport" },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
    partytown({
      config: { forward: ["dataLayer.push", "ym", "gtag", "fbq"] },
    }),
    compress({
      CSS: true,
      HTML: { "html-minifier-terser": { removeComments: true } },
      Image: false,
      JavaScript: true,
      SVG: true,
    }),
  ],
  vite: { plugins: [copyApiFolder(), copyHtaccess()] },
});
