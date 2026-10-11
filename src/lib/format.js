// Tarihi sayfanın dilinde ve sabit saat diliminde biçimler. Saat dilimi sabit
// olduğu için sunucu ve tarayıcı aynı metni üretir (hidrasyon uyuşmazlığı olmaz).
export function formatDate(value, locale = 'tr') {
  return new Date(value).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Istanbul'
  });
}
