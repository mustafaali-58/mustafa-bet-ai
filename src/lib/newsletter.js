import { createHmac, timingSafeEqual } from 'crypto';

export const SITE_URL = (process.env.SITE_URL || 'https://mustafaalisolmazgul.com.tr').replace(/\/+$/, '');
export const FROM_ADDRESS = 'Mustafa Ali Solmazgül <hello@mustafaalisolmazgul.com.tr>';
export const LOCALES = ['tr', 'en'];

const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;
const EMAIL_PATTERN = /^[^\s@<>"',;:\\]+@[^\s@<>"',;:\\]+\.[^\s@<>"',;:\\]{2,}$/;

export function normalizeLocale(locale) {
  return LOCALES.includes(locale) ? locale : 'tr';
}

/** Geçerliyse küçük harfe çevrilmiş adresi, değilse null döner. */
export function normalizeEmail(value) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) return null;
  return email;
}

function getSecret() {
  // Ayrı bir sır tanımlı değilse Resend anahtarı HMAC anahtarı olarak kullanılır;
  // böylece ek yapılandırma olmadan da çalışır.
  return process.env.NEWSLETTER_SECRET || process.env.RESEND_API_KEY || null;
}

function sign(payload, secret) {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** Onay bağlantısı için imzalı, süreli belirteç üretir. */
export function createConfirmToken(email, locale) {
  const secret = getSecret();
  if (!secret) throw new Error('Newsletter secret is not configured');

  const payload = Buffer.from(
    JSON.stringify({ e: email, l: locale, x: Date.now() + TOKEN_TTL_MS })
  ).toString('base64url');

  return `${payload}.${sign(payload, secret)}`;
}

/** Belirteç geçerliyse { email, locale }, değilse null döner. */
export function verifyConfirmToken(token) {
  const secret = getSecret();
  if (!secret || typeof token !== 'string' || token.length > 1024) return null;

  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length) return null;

  const expected = Buffer.from(sign(payload, secret));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    const email = normalizeEmail(data.e);
    if (!email || typeof data.x !== 'number' || data.x < Date.now()) return null;
    return { email, locale: normalizeLocale(data.l) };
  } catch {
    return null;
  }
}

const EMAIL_COPY = {
  tr: {
    subject: 'Bülten aboneliğinizi onaylayın',
    heading: 'Aboneliğinizi onaylayın',
    body: 'Bültenime abone olmak için aşağıdaki düğmeye tıklayın. Bağlantı 48 saat geçerlidir.',
    button: 'Aboneliği Onayla',
    ignore: 'Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; adresiniz listeye eklenmez.',
    signoff: 'Sevgiler'
  },
  en: {
    subject: 'Confirm your newsletter subscription',
    heading: 'Confirm your subscription',
    body: 'Click the button below to subscribe to my newsletter. The link is valid for 48 hours.',
    button: 'Confirm Subscription',
    ignore: "If you didn't request this, you can ignore this email; your address won't be added to the list.",
    signoff: 'Best regards'
  }
};

export function buildConfirmEmail(locale, confirmUrl) {
  const copy = EMAIL_COPY[normalizeLocale(locale)];

  return {
    subject: copy.subject,
    text: `${copy.heading}\n\n${copy.body}\n\n${confirmUrl}\n\n${copy.ignore}\n\n${copy.signoff},\nMustafa Ali Solmazgül`,
    html: `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #6366f1;">${copy.heading}</h2>
        <p>${copy.body}</p>
        <p style="margin: 28px 0;">
          <a href="${confirmUrl}" style="background: #6366f1; color: #fff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: 600;">${copy.button}</a>
        </p>
        <p style="font-size: 13px; color: #666;">${copy.ignore}</p>
        <br/>
        <p>${copy.signoff},<br/><strong>Mustafa Ali Solmazgül</strong><br/><a href="${SITE_URL}" style="color: #8b5cf6; text-decoration: none;">${SITE_URL.replace(/^https?:\/\//, '')}</a></p>
      </div>
    `
  };
}

const PAGE_COPY = {
  tr: {
    okTitle: 'Aboneliğiniz onaylandı 🎉',
    okBody: 'Bültenime hoş geldiniz. Yeni yazılar ve güncellemeler artık e-postanıza gelecek.',
    badTitle: 'Bağlantı geçersiz',
    badBody: 'Onay bağlantısı hatalı ya da süresi dolmuş. Lütfen siteden yeniden abone olun.',
    errorTitle: 'Bir sorun oluştu',
    errorBody: 'Aboneliğiniz şu anda kaydedilemedi. Lütfen aynı bağlantıyı biraz sonra tekrar deneyin.',
    back: 'Siteye dön'
  },
  en: {
    okTitle: 'Subscription confirmed 🎉',
    okBody: 'Welcome to my newsletter. New posts and updates will now arrive in your inbox.',
    badTitle: 'Invalid link',
    badBody: 'The confirmation link is invalid or has expired. Please subscribe again from the site.',
    errorTitle: 'Something went wrong',
    errorBody: 'Your subscription could not be saved right now. Please try the same link again later.',
    back: 'Back to the site'
  }
};

/** Onay bağlantısına tıklayan kişiye gösterilen küçük sonuç sayfası. */
export function buildResultPage(locale, kind) {
  const lang = normalizeLocale(locale);
  const copy = PAGE_COPY[lang];
  const title = copy[`${kind}Title`];
  const body = copy[`${kind}Body`];

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${title}</title>
<style>
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b0f1a; color: #e5e7eb; font-family: system-ui, sans-serif; }
  main { max-width: 440px; padding: 32px 24px; text-align: center; }
  h1 { font-size: 1.5rem; margin: 0 0 12px; }
  p { line-height: 1.6; color: #9ca3af; margin: 0 0 28px; }
  a { display: inline-block; background: #6366f1; color: #fff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: 600; }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <p>${body}</p>
  <a href="${SITE_URL}/${lang}">${copy.back}</a>
</main>
</body>
</html>`;
}
