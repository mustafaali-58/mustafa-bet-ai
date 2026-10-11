import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['tr', 'en'],
  defaultLocale: 'tr',
  // Dil karşılıkları (hreflang) sayfa bazında HTML içinde verilir (bkz.
  // lib/seo.js); çevirisi olmayan yazılar için yanlış adres üretmemesi adına
  // ara katmanın otomatik `Link` başlığı kapatılır.
  alternateLinks: false
});
