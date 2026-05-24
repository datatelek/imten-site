// Хелпер для base-path. На превью GitHub Pages base = '/imten-site/',
// на проде imten.ru base = '/'. Применяется к внутренним ссылкам в шаблонах.
//
// В .astro файлах: import { withBase } from "~/utils/url"; href={withBase("/services")}
// Для http://, https://, mailto:, tel:, # — возвращает как есть.

const BASE_RAW = (import.meta as any).env?.BASE_URL ?? "/";
export const BASE = BASE_RAW.endsWith("/") ? BASE_RAW.slice(0, -1) : BASE_RAW;

export function withBase(path: string | undefined | null): string {
  if (!path) return "/";
  if (/^(https?:|mailto:|tel:|#)/i.test(path)) return path;
  if (!path.startsWith("/")) return path;
  return BASE + path;
}
