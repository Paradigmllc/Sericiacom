// Adds mobile-menu nav.* keys to all 10 locale files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = path.resolve(__dirname, "../messages");

const NAV_KEYS = {
  en: { open_menu: "Open menu", close_menu: "Close menu", primary_navigation: "Primary navigation", menu_eyebrow: "Menu", wishlist: "Wishlist" },
  ja: { open_menu: "メニューを開く", close_menu: "メニューを閉じる", primary_navigation: "メインナビゲーション", menu_eyebrow: "メニュー", wishlist: "お気に入り" },
  de: { open_menu: "Menü öffnen", close_menu: "Menü schließen", primary_navigation: "Hauptnavigation", menu_eyebrow: "Menü", wishlist: "Wunschliste" },
  fr: { open_menu: "Ouvrir le menu", close_menu: "Fermer le menu", primary_navigation: "Navigation principale", menu_eyebrow: "Menu", wishlist: "Favoris" },
  es: { open_menu: "Abrir menú", close_menu: "Cerrar menú", primary_navigation: "Navegación principal", menu_eyebrow: "Menú", wishlist: "Favoritos" },
  it: { open_menu: "Apri il menù", close_menu: "Chiudi il menù", primary_navigation: "Navigazione principale", menu_eyebrow: "Menù", wishlist: "Preferiti" },
  ko: { open_menu: "메뉴 열기", close_menu: "메뉴 닫기", primary_navigation: "주요 내비게이션", menu_eyebrow: "메뉴", wishlist: "위시리스트" },
  "zh-TW": { open_menu: "開啟選單", close_menu: "關閉選單", primary_navigation: "主選單", menu_eyebrow: "選單", wishlist: "願望清單" },
  ru: { open_menu: "Открыть меню", close_menu: "Закрыть меню", primary_navigation: "Главное меню", menu_eyebrow: "Меню", wishlist: "Избранное" },
  ar: { open_menu: "فتح القائمة", close_menu: "إغلاق القائمة", primary_navigation: "التنقل الرئيسي", menu_eyebrow: "القائمة", wishlist: "المفضلة" },
};

const LOCALES = ["en", "ja", "de", "fr", "es", "it", "ko", "zh-TW", "ru", "ar"];
let added = 0;
let skipped = 0;

for (const locale of LOCALES) {
  const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  json.nav ??= {};
  for (const [k, v] of Object.entries(NAV_KEYS[locale])) {
    if (json.nav[k] !== undefined) { skipped++; continue; }
    json.nav[k] = v;
    added++;
  }
  fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + "\n", "utf8");
}
console.log(`[mobile-menu-i18n] added ${added} keys, skipped ${skipped} pre-existing`);
