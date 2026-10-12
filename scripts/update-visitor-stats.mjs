// Sitedeki ziyaretçi sayacını Vercel Web Analytics verisinden günceller.
// Yayın iş akışında çalışır (bkz. .github/workflows/auto-blog.yml) ve
// src/data/visitor-stats.json dosyasını yazar.
//
// Hobby planında yalnızca son 31 günün verisi sorgulanabildiği için tamamlanan
// günler dosyada birikir ("completed"). Günün o ana kadarki verisi ayrı tutulur
// ("today") ve her çalıştırmada yeniden hesaplanır; böylece hiçbir gün iki kez
// sayılmaz.
//
// Gerekli ortam değişkenleri: VERCEL_TOKEN, VERCEL_PROJECT_ID, isteğe bağlı
// VERCEL_ORG_ID. Hata olursa dosyaya dokunulmaz ve çalıştırma uyarıyla biter.
// Denemeler için dosya yolu ilk argümanla, API adresi VERCEL_API_BASE ile
// değiştirilebilir.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = process.argv[2] || path.join(__dirname, '..', 'src/data/visitor-stats.json');
const API = `${process.env.VERCEL_API_BASE || 'https://api.vercel.com'}/v1/query/web-analytics/visits/aggregate`;
const DAY_MS = 86_400_000;
const MAX_LOOKBACK_DAYS = 30;

const token = process.env.VERCEL_TOKEN;
const projectId = process.env.VERCEL_PROJECT_ID;
const teamId = process.env.VERCEL_ORG_ID;

const isoDay = date => date.toISOString().slice(0, 10);
const nextDay = day => isoDay(new Date(Date.parse(`${day}T00:00:00Z`) + DAY_MS));

function emptyBucket() {
  return { visitors: 0, pageviews: 0, countries: {} };
}

function addRow(bucket, row) {
  const visitors = Number(row.visitors) || 0;
  const pageviews = Number(row.pageviews) || 0;
  if (!visitors && !pageviews) return;
  // Ülkesi bilinmeyen ya da "diğer" olarak gruplanan ziyaretler "ZZ" altında toplanır.
  const code = /^[A-Z]{2}$/.test(row.country || '') ? row.country : 'ZZ';
  bucket.visitors += visitors;
  bucket.pageviews += pageviews;
  const country = bucket.countries[code] || { visitors: 0, pageviews: 0 };
  country.visitors += visitors;
  country.pageviews += pageviews;
  bucket.countries[code] = country;
}

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (data && data.completed) return data;
  } catch {
    // Dosya yoksa ya da bozuksa baştan başlanır.
  }
  return { since: null, lastCompleteDay: null, completed: emptyBucket(), today: null, updatedAt: null };
}

async function query(since, until) {
  const params = new URLSearchParams({ projectId, since, until, limit: '100' });
  if (teamId) params.set('teamId', teamId);
  params.append('by', 'day');
  params.append('by', 'country');

  const res = await fetch(`${API}?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000)
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Web Analytics isteği başarısız (HTTP ${res.status}): ${body?.error?.message || 'ayrıntı yok'}`);
  }
  return Array.isArray(body?.data) ? body.data : [];
}

async function main() {
  if (!token || !projectId) {
    console.log('Ziyaretçi sayacı: VERCEL_TOKEN ya da VERCEL_PROJECT_ID yok, atlandı.');
    return;
  }

  const now = new Date();
  const today = isoDay(now);
  const yesterday = isoDay(new Date(now.getTime() - DAY_MS));
  const earliest = isoDay(new Date(now.getTime() - MAX_LOOKBACK_DAYS * DAY_MS));

  const state = load();
  let start = state.lastCompleteDay ? nextDay(state.lastCompleteDay) : earliest;
  if (start < earliest) {
    console.log(`::warning::Ziyaretçi sayacı ${start} ile ${earliest} arasını kaçırdı (Hobby planı yalnızca son 31 günü verir).`);
    start = earliest;
  }

  const rows = await query(`${start}T00:00:00.000Z`, `${today}T23:59:59.999Z`);

  const todayBucket = emptyBucket();
  let firstDay = null;
  for (const row of rows) {
    const day = String(row.timestamp || '').slice(0, 10);
    if (!day || day < start || day > today) continue;
    if ((Number(row.visitors) || 0) > 0 && (!firstDay || day < firstDay)) firstDay = day;
    if (day <= yesterday) addRow(state.completed, row);
    else addRow(todayBucket, row);
  }

  if (start <= yesterday) state.lastCompleteDay = yesterday;
  state.today = { day: today, ...todayBucket };
  if (!state.since && firstDay) state.since = firstDay;
  state.updatedAt = now.toISOString();

  fs.writeFileSync(FILE, `${JSON.stringify(state, null, 2)}\n`);
  const total = state.completed.visitors + todayBucket.visitors;
  const countries = new Set([...Object.keys(state.completed.countries), ...Object.keys(todayBucket.countries)]);
  console.log(`Ziyaretçi sayacı güncellendi: ${total} ziyaretçi, ${countries.size} ülke (${start} → ${today}).`);
}

main().catch(error => {
  // Sayaç güncellenemese de yayın sürer; mevcut dosya olduğu gibi kalır.
  console.log(`::warning::Ziyaretçi sayacı güncellenemedi: ${error.message}`);
});
