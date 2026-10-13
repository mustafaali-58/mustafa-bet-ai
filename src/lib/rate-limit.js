// Basit, bellek içi kayan pencere hız sınırlayıcı.
//
// Sunucusuz ortamda (Vercel) her fonksiyon örneği kendi belleğini tutar; bu
// yüzden sınır "en iyi çaba" düzeyindedir: tek bir örneğe gelen yoğun isteği
// keser ama örnekler arasında paylaşılmaz. Kesin bir sınır gerekiyorsa Vercel
// Firewall hız kuralı ya da paylaşımlı bir depo (ör. Upstash Redis) kullanın.

const buckets = new Map();
const MAX_KEYS = 5000;

function prune(now) {
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
  // Hâlâ çok büyükse en eski kayıtları at (Map ekleme sırasını korur).
  while (buckets.size > MAX_KEYS) {
    buckets.delete(buckets.keys().next().value);
  }
}

/**
 * @param {string} key      Sınırlanan özne (ör. "chat:1.2.3.4")
 * @param {number} limit    Pencere başına izin verilen istek sayısı
 * @param {number} windowMs Pencere süresi (ms)
 * @returns {{ ok: boolean, retryAfter: number }} retryAfter saniye cinsindendir
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  if (buckets.size >= MAX_KEYS) prune(now);

  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * Sayacı artırmadan, anahtarın penceresinde sınıra ulaşıp ulaşmadığını söyler.
 * Hatalı giriş denemeleri gibi yalnızca başarısızlıkların sayıldığı durumlar için.
 * @returns {{ limited: boolean, retryAfter: number }}
 */
export function peekRateLimit(key, limit) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now || entry.count < limit) return { limited: false, retryAfter: 0 };
  return { limited: true, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
}

/** İstemci IP'sini proxy başlıklarından okur (Vercel `x-forwarded-for` ekler). */
export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
