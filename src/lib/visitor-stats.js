import stats from '@/data/visitor-stats.json';

/**
 * Alt bilgideki ziyaretçi sayacının verisi. Dosyayı yayın iş akışı Vercel Web
 * Analytics'ten günceller (bkz. scripts/update-visitor-stats.mjs). Ziyaretçi,
 * Vercel'in tanımıyla günlük tekil ziyaretçidir; günler toplanarak bulunur.
 */
export function visitorSummary(limit = 3) {
  const completed = stats?.completed || { visitors: 0, countries: {} };
  const today = stats?.today || { visitors: 0, countries: {} };

  const byCountry = new Map();
  for (const bucket of [completed, today]) {
    for (const [code, value] of Object.entries(bucket.countries || {})) {
      byCountry.set(code, (byCountry.get(code) || 0) + (Number(value?.visitors) || 0));
    }
  }

  // "ZZ": ülkesi bilinmeyen ziyaretler; ülke sayısına katılmaz.
  const countries = [...byCountry.entries()]
    .filter(([code, visitors]) => code !== 'ZZ' && visitors > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([code, visitors]) => ({ code, visitors }));

  return {
    visitors: (Number(completed.visitors) || 0) + (Number(today.visitors) || 0),
    countryCount: countries.length,
    topCountries: countries.slice(0, limit),
    updatedAt: stats?.updatedAt || null
  };
}
